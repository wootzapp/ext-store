// pages/popup/views/Settings/Settings.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useUserOrgs from '@/hooks/useUserOrgs';

import ProfileSection from '@/components/settings/ProfileSection';
import DefaultSearchEngineSection from '@/components/settings/DefaultSearchEngineSection';
import UseOwnKeySection from '@/components/settings/UseOwnKeySection';
import OrganizationsSection from '@/components/settings/OrganizationsSection';

import StorageUtils, { SUPPORTED_MODELS, SEARCH_ENGINES } from '@/storage';
import auth from '@/services/auth';

const PRICING_URL = 'https://nextjs-app-410940835135.us-central1.run.app/pricing';

// Helper: derive current org + validity
function useSubscriptionInfo(userFromApi, organizations) {
  return React.useMemo(() => {
    const currentOrg =
      (userFromApi?.selectedOrganizationId &&
        organizations?.find(o => Number(o.id) === Number(userFromApi.selectedOrganizationId))) ||
      (organizations?.[0] ?? null);

    if (!currentOrg) return { invalid: true, reason: 'No subscription found', org: null };

    const status = String(currentOrg.subscriptionStatus || '').toLowerCase();
    const type = String(currentOrg.subscriptionType || 'free').toLowerCase();
    const expiryTs = Number.isFinite(Date.parse(currentOrg.subExpiry))
      ? new Date(currentOrg.subExpiry).getTime()
      : null;

    const now = Date.now();
    const isExpired = expiryTs ? expiryTs <= now : false;
    const isBadStatus = ['canceled', 'past_due', 'unpaid', 'inactive'].includes(status);
    const isInactive = currentOrg.isActive === false;
    const isNotPaid = type !== 'paid';

    const invalid = isInactive || isBadStatus || isExpired || isNotPaid;

    let reason = '';
    if (isInactive) reason = 'Your subscription is inactive.';
    else if (isBadStatus) reason = `Your subscription is ${status.replace('_', ' ')}.`;
    else if (isExpired) reason = 'Your subscription has expired.';
    else if (isNotPaid) reason = 'You are on the Free plan.';

    return { invalid, reason, org: currentOrg };
  }, [userFromApi, organizations]);
}

// Snapshot helpers (compare local draft vs last saved)
function makeSnapshot(draft, draftSearchEngine) {
  return {
    useOwnKey: !!draft.useOwnKey,
    selectedModel: draft.selectedModel || '',
    apiKey: draft.apiKey || '',
    selectedSearchEngine: draftSearchEngine || '',
  };
}
function snapshotsEqual(a, b) {
  return (
    a.useOwnKey === b.useOwnKey &&
    a.selectedModel === b.selectedModel &&
    a.apiKey === b.apiKey &&
    a.selectedSearchEngine === b.selectedSearchEngine
  );
}

export default function Settings({ onBack }) {
  const {
    authUser, isAuthed, authLoading, authError, setAuthError,
    prefs, setPrefs, selectedSearchEngine, setSelectedSearchEngine,
    loadPrefs, savePrefs,
  } = useAuthAndPrefs();

  const contentRef = useRef(null);
  const ownKeyRef = useRef(null);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const { loading: orgsLoading, error: orgsError, user: userFromApi, organizations } = useUserOrgs();
  const subInfo = useSubscriptionInfo(userFromApi, organizations);

  // ---------- LOCAL DRAFT ----------
  const [draft, setDraft] = useState({ useOwnKey: false, selectedModel: '', apiKey: '' });
  const [draftSearchEngine, setDraftSearchEngine] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState(makeSnapshot(draft, draftSearchEngine));
  const [snapshotInitialized, setSnapshotInitialized] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const currentSnapshot = useMemo(
    () => makeSnapshot(draft, draftSearchEngine),
    [draft, draftSearchEngine]
  );
  const hasUnsaved = useMemo(
    () => snapshotInitialized && !snapshotsEqual(savedSnapshot, currentSnapshot),
    [snapshotInitialized, savedSnapshot, currentSnapshot]
  );

  // Smooth scroll
  const scrollToOwnKey = useCallback(() => {
    const container = contentRef.current;
    const anchor = ownKeyRef.current;
    if (!container || !anchor) return;
    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const delta = anchorRect.top - containerRect.top + container.scrollTop - 12;
    container.scrollTo({ top: delta, behavior: 'smooth' });
  }, []);

  // ---- HYDRATION FIX ----
  // 1) Start loading persisted prefs on mount.
  useEffect(() => {
    if (!isAuthed) return;
    (async () => { await loadPrefs(); })();
  }, [isAuthed, loadPrefs]);

  // 2) When persisted prefs actually hydrate, mirror them into the draft
  //    (unless the user has local edits). Only then mark screen as loaded.
  useEffect(() => {
    if (!isAuthed) return;
    if (!hasUnsaved) {
      const nextDraft = {
        useOwnKey: !!(prefs?.useOwnKey),
        selectedModel: prefs?.selectedModel || '',
        apiKey: prefs?.apiKey || '',
      };
      const nextEngine = selectedSearchEngine || '';
      setDraft(nextDraft);
      setDraftSearchEngine(nextEngine);
      setSavedSnapshot(makeSnapshot(nextDraft, nextEngine));
      setSnapshotInitialized(true);
      setIsLoading(false);
    }
  }, [
    isAuthed,
    prefs?.useOwnKey,
    prefs?.selectedModel,
    prefs?.apiKey,
    selectedSearchEngine,
    hasUnsaved,
  ]);
  // ---- /HYDRATION FIX ----

  // Success toast timeout
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // beforeunload guard
  useEffect(() => {
    const handler = (e) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsaved]);

  const openManageSubscription = () => {
    try {
      if (chrome?.tabs?.open) chrome.tabs.open(PRICING_URL);
      else if (chrome?.tabs?.create) chrome.tabs.create({ url: PRICING_URL });
      else window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    }
  };

  // SAVE uses local draft exclusively
  const handleSave = useCallback(async () => {
    setValidationError('');
    setSuccessMessage('');

    const { selectedModel, apiKey, useOwnKey } = draft;

    // Only enforce validation when user intends to use their own key
    if (useOwnKey) {
      if (!selectedModel) {
        setValidationError('Please select a model');
        return false;
      }
      if (!apiKey?.trim()) {
        setValidationError('Please enter your API key');
        return false;
      }
    }

    setIsValidating(true);
    try {
      if (useOwnKey && selectedModel && apiKey?.trim()) {
        const formatValidation = StorageUtils.validateApiKey(selectedModel, apiKey);
        if (!formatValidation.valid) {
          setValidationError(`Invalid API key format: ${formatValidation.error}`);
          setIsValidating(false);
          return false;
        }
        const testResult = await StorageUtils.testApiKey(selectedModel, apiKey.trim());
        if (!testResult.valid) {
          const baseError = testResult.error || 'The API key you entered is not valid or has expired.';
          let msg = baseError;
          if (baseError.includes('Unauthorized') || baseError.includes('401')) {
            msg = `❌ Invalid API Key: ${baseError}\n\nPlease verify that you copied the correct key and it hasn't been revoked.`;
          } else if (baseError.includes('Forbidden') || baseError.includes('403')) {
            msg = `🚫 Access Denied: ${baseError}\n\nYour API key may lack required permissions.`;
          } else if (baseError.includes('Rate limit') || baseError.includes('429')) {
            msg = `⏰ Rate Limited: ${baseError}\n\nPlease wait a few minutes and try again.`;
          } else if (baseError.includes('Network error')) {
            msg = `🌐 Connection Issue: ${baseError}\n\nCheck your internet and retry.`;
          } else if (baseError.includes('server') || baseError.includes('500')) {
            msg = `🔧 Server Issue: ${baseError}\n\nService is temporarily unavailable.`;
          } else {
            msg = `❌ Validation Failed: ${baseError}\n\nPlease check your API key and try again.`;
          }
          setValidationError(msg);
          setIsValidating(false);
          return false;
        }
      }

      // Persist draft (always store model/key; toggle decides whether extension uses it)
      const toSave = {
        selectedModel: draft.selectedModel,
        apiKey: draft.apiKey.trim(),
        useOwnKey: !!useOwnKey,
        setupDate: new Date().toISOString(),
      };
      await savePrefs(toSave, draftSearchEngine);
      await StorageUtils.setUseOwnKey(!!useOwnKey);

      if (draft.selectedModel) await StorageUtils.saveSelectedModel(draft.selectedModel);
      if (draft.apiKey?.trim()) await StorageUtils.saveApiKey(draft.selectedModel, draft.apiKey.trim());

      // Update Wootz browser config if we have a model + key
      const selectedEngineData = SEARCH_ENGINES.find(e => e.id === draftSearchEngine);
      const selectedModelData = SUPPORTED_MODELS[draft.selectedModel];
      if (
        chrome?.wootz?.changeWootzAppSearchConfiguration &&
        selectedModelData &&
        draft.apiKey?.trim()
      ) {
        chrome.wootz.changeWootzAppSearchConfiguration(
          selectedEngineData?.keyword,
          selectedModelData?.baseUrlToSearch,
          draft.apiKey.trim(),
          (result) => {
            if (!result.success) console.error('❌ Error saving Wootz configuration:', result.error);
          }
        );
      }

      // Sync hook state (for other screens)
      setSelectedSearchEngine(draftSearchEngine);
      setPrefs(toSave);

      // Update baseline snapshot
      const newSnap = makeSnapshot(draft, draftSearchEngine);
      setSavedSnapshot(newSnap);
      if (!snapshotInitialized) setSnapshotInitialized(true);

      setSuccessMessage('Settings updated!');
      return true;
    } catch (err) {
      console.error('❌ Settings update error:', err);
      setValidationError('Failed to save settings. Please check your connection and try again.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [draft, draftSearchEngine, savePrefs, setPrefs, setSelectedSearchEngine, snapshotInitialized]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating && hasUnsaved) handleSave();
  };

  // ---------- AUTH GATE ----------
  if (authLoading) {
    return (
      <motion.div className="w-full h-full flex items-center justify-center bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </motion.div>
    );
  }

  if (!isAuthed) {
    return (
      <motion.div
        className="w-full h-full bg-white flex flex-col relative overflow-hidden"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <button onClick={onBack} className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors">Back</button>
            <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">Settings</h1>
            <div className="w-16" />
          </div>
        </div>

        {/* Auth Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
          <div className="max-w-sm w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Authenticate</h2>
            <p className="text-gray-600 mb-6">You need to sign in to manage your settings and API configuration.</p>
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authError}</div>
            )}
            <motion.button
              onClick={async () => {
                try {
                  setAuthError('');
                  setIsAuthenticating(true);
                  await auth.startGitHubLogin();
                } catch (e) {
                  setAuthError(e?.message || 'Authentication failed. Please try again.');
                } finally {
                  setIsAuthenticating(false);
                }
              }}
              disabled={isAuthenticating}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isAuthenticating
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg'
              }`}
              whileHover={isAuthenticating ? {} : { scale: 1.02 }}
              whileTap={isAuthenticating ? {} : { scale: 0.98 }}
            >
              {isAuthenticating ? 'Authenticating…' : 'Sign in with GitHub'}
            </motion.button>
            <p className="text-xs text-gray-500 mt-3">A small window or tab will open to complete sign-in.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---------- MAIN UI ----------
  if (isLoading) {
    return (
      <motion.div className="w-full h-full flex items-center justify-center bg-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full h-full bg-white flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (hasUnsaved) setConfirmLeaveOpen(true);
              else onBack();
            }}
            className="text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
          >
            Back
          </button>

          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">Settings</h1>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {hasUnsaved && (
                <motion.button
                  key="update-btn"
                  onClick={handleSave}
                  disabled={isValidating}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isValidating
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white shadow'
                  }`}
                >
                  {isValidating ? 'Saving…' : 'Update'}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 p-6 overflow-y-auto overflow-x-hidden relative z-10">
        {!hasUnsaved && successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-green-700 font-medium">Settings saved and active</p>
            </div>
          </div>
        )}

        <div className="space-y-6 max-w-full">
          <ProfileSection user={authUser} />

          {!orgsLoading && subInfo.invalid && (
            <div className="mb-6 p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.588c.718 1.277-.18 2.863-1.742 2.863H3.48c-1.562 0-2.46-1.586-1.742-2.863L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Subscription not active</p>
                  <p className="text-sm text-amber-800 mt-1">
                    {subInfo.reason || 'Your subscription is not active.'} You can purchase a plan or use your own API key to continue.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={openManageSubscription}
                      className="px-3 py-2 rounded-md text-sm font-medium bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      View plans
                    </button>
                    <button
                      onClick={() => {
                        setSuccessMessage('');
                        setValidationError('');
                        setDraft(d => ({ ...d, useOwnKey: true }));
                        requestAnimationFrame(() => {
                          scrollToOwnKey();
                          setTimeout(() => {
                            const input = ownKeyRef.current?.querySelector('input[type="password"], input');
                            input?.focus();
                          }, 350);
                        });
                      }}
                      className="px-3 py-2 rounded-md text-sm font-medium bg-amber-600 text-white hover:bg-amber-700"
                    >
                      Use your own API key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <OrganizationsSection
            loading={orgsLoading}
            error={orgsError}
            user={userFromApi}
            organizations={organizations}
            onManageClick={openManageSubscription}
          />

          <DefaultSearchEngineSection
            isEditMode={true}
            selectedSearchEngine={draftSearchEngine}
            onSelect={(id) => {
              setDraftSearchEngine(id);
              setSuccessMessage('');
            }}
          />

          <div ref={ownKeyRef}>
            <UseOwnKeySection
              isEditMode={true}
              showSaveButton={false}
              isValidating={isValidating}
              useOwnKey={draft.useOwnKey}
              setUseOwnKey={(updater) =>
                setDraft(prev => {
                  const nextVal = typeof updater === 'function' ? updater(prev.useOwnKey) : updater;
                  return { ...prev, useOwnKey: nextVal };
                })
              }
              selectedModel={draft.selectedModel}
              setSelectedModel={(modelId) => setDraft(prev => ({ ...prev, selectedModel: modelId }))}
              apiKey={draft.apiKey}
              setApiKey={(k) => setDraft(prev => ({ ...prev, apiKey: k }))}
              onKeyPress={handleKeyPress}
              onSave={handleSave}
              validationError={validationError}
              successMessage={successMessage}
            />
          </div>
        </div>
      </div>

      {/* Unsaved changes modal */}
      <AnimatePresence>
        {confirmLeaveOpen && (
          <motion.div
            key="unsaved-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="w-[92%] max-w-md rounded-2xl bg-white p-5 shadow-xl border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900">Unsaved changes</h3>
              <p className="text-sm text-gray-600 mt-1">You’ve made changes to your settings. Save them before leaving?</p>

              <div className="mt-5 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={async () => {
                    const ok = await handleSave();
                    if (ok) {
                      setConfirmLeaveOpen(false);
                      onBack();
                    }
                  }}
                  disabled={isValidating}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    isValidating
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600'
                  }`}
                >
                  {isValidating ? 'Saving…' : 'Save & leave'}
                </button>
                <button
                  onClick={() => { setConfirmLeaveOpen(false); onBack(); }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
                >
                  Discard
                </button>
                <button
                  onClick={() => setConfirmLeaveOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}