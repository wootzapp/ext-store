// src/pages/popup/views/Plans.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import useUserOrgs from '@/hooks/useUserOrgs';

const SITE_BASE = 'https://nextjs-app-410940835135.us-central1.run.app';
const API_BASE = `${SITE_BASE}/api`;
const DEBUG = true;

function log(...args) { if (DEBUG) console.log('[Plans]', ...args); }

async function postJSON(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
    signal,
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

function openAuthPopup() {
  try {
    if (chrome?.windows?.create) {
      chrome.windows.create({
        url: `${SITE_BASE}/ext/sign-in`,
        type: 'popup',
        width: 500,
        height: 600,
      });
    } else {
      window.open(`${SITE_BASE}/ext/sign-in`, '_blank', 'noopener,noreferrer,width=500,height=600');
    }
  } catch {
    window.open(`${SITE_BASE}/ext/sign-in`, '_blank', 'noopener,noreferrer,width=500,height=600');
  }
}

function openInNewTab(url) {
  try {
    if (chrome?.tabs?.create) chrome.tabs.create({ url });
    else window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export default function Plans({
  onBack,
  preselectedOrgId = null,
  defaultCurrency = 'inr',
}) {
  // ----- currency dropdown (like the Research depth menu) -----
  const currencyOptions = [
    { code: 'inr', label: 'INR' },
    { code: 'usd', label: 'USD' },
    { code: 'eur', label: 'EUR' },
    { code: 'gbp', label: 'GBP' },
  ];
  const [currency, setCurrency] = useState((defaultCurrency || 'inr').toLowerCase());
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 80, left: 20 });

  const toggleCurrency = () => {
    setIsCurrencyOpen((v) => {
      const next = !v;
      if (next && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        const desiredWidth = 200;
        const left = Math.min(
          window.innerWidth - desiredWidth - 8,
          Math.max(8, r.right - desiredWidth)
        );
        setMenuPos({ top: r.bottom + 8, left });
      }
      return next;
    });
  };

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isCurrencyOpen) return;
      const inButton = btnRef.current?.contains(e.target);
      const inMenu = dropdownRef.current?.contains(e.target);
      if (!inButton && !inMenu) setIsCurrencyOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCurrencyOpen]);

  // ----- pricing fetch -----
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [products, setProducts] = useState([]);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true); setErr('');
      try {
        const data = await postJSON(`${API_BASE}/pricing/currency`, { currency });
        if (!abort) setProducts(Array.isArray(data?.products) ? data.products : []);
      } catch (e) {
        if (!abort) setErr(e?.message || 'Failed to fetch pricing');
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, [currency]);

  // ----- org (read-only) -----
  const { organizations, selectedOrg } = useUserOrgs();
  const selectedOrgIdFromHook = selectedOrg?.id ?? selectedOrg?.organizationId ?? null;
  const billingOrgId = useMemo(() => {
    const preselected = preselectedOrgId;
    const selected = selectedOrgIdFromHook;
    
    // Ensure we get a proper ID, not an object
    const id = preselected ?? selected ?? null;
    
    // If it's an object, try to extract the ID
    if (id && typeof id === 'object') {
      return id.id ?? id.organizationId ?? null;
    }
    
    return id;
  }, [preselectedOrgId, selectedOrgIdFromHook]);
  
  const billedOrg = useMemo(() => {
    const id = billingOrgId;
    if (!id) return null;
    return (organizations ?? []).find(o => String(o.id ?? o.organizationId) === String(id));
  }, [organizations, billingOrgId]);
  
  const billingOrgName = useMemo(() => {
    // Debug logging to help identify the object issue
    if (DEBUG) {
      console.log('[Plans] Debug billing org:', {
        preselectedOrgId,
        selectedOrgIdFromHook,
        billingOrgId,
        billedOrg,
        organizations: organizations?.length || 0
      });
    }
    
    if (billedOrg?.name) {
      return billedOrg.name;
    }
    if (billingOrgId) {
      // Ensure billingOrgId is a string/number, not an object
      const id = typeof billingOrgId === 'object' ? 
        (billingOrgId?.id ?? billingOrgId?.organizationId ?? 'Unknown') : 
        billingOrgId;
      return `Org #${id}`;
    }
    return '—';
  }, [billedOrg?.name, billingOrgId, preselectedOrgId, selectedOrgIdFromHook, billedOrg, organizations]);
  const billingOrgStatus = billedOrg?.subscriptionStatus || '';

  const startCheckout = async (priceId, org) => {
    setCheckoutBusy(true);
    setErr('');
    try {
      const data = await postJSON(`${API_BASE}/payments/checkout`, {
        priceId,
        organizationId: org,
      });
      if (data?.url) openInNewTab(data.url);
      else throw new Error('Checkout URL not returned');
    } catch (e) {
      if (e?.status === 401) {
        setErr('Please sign in to continue.');
        openAuthPopup();
      } else {
        setErr(e?.message || 'Failed to start checkout');
      }
    } finally {
      setCheckoutBusy(false);
    }
  };

  const onPurchase = async (priceId) => {
    if (!billingOrgId) {
      setErr('No billing organization found.');
      return;
    }
    return startCheckout(priceId, billingOrgId);
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col relative min-w-0"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white" />
      </div>

      {/* Foreground */}
      <div className="flex-1 flex flex-col p-4 relative z-10 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => onBack?.()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <FaArrowLeft size={14} />
            <span className="font-medium text-sm">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800">Plans</h1>
            <p className="text-xs text-gray-600">Choose your subscription</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Currency</span>
            <button
              ref={btnRef}
              type="button"
              onClick={toggleCurrency}
              className="bg-white text-gray-700 border border-gray-300 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 flex items-center justify-between min-w-[90px] hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              title="Currency"
            >
              <span className="font-medium">
                {(currencyOptions.find(c => c.code === currency)?.label || currency).toUpperCase()}
              </span>
              <motion.svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                animate={{ rotate: isCurrencyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            {isCurrencyOpen && createPortal(
              <AnimatePresence>
                <motion.ul
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="fixed bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
                  style={{
                    pointerEvents: 'auto',
                    top: menuPos.top,
                    left: menuPos.left,
                    zIndex: 999999,
                    minWidth: 160,
                    maxWidth: 260
                  }}
                >
                  {currencyOptions.map((c) => {
                    const active = c.code === currency;
                    return (
                      <li
                        key={c.code}
                        className={`px-4 py-2 cursor-pointer text-sm transition-colors duration-200 ${
                          active ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => { setCurrency(c.code); setIsCurrencyOpen(false); }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{c.label}</span>
                          {active && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </motion.ul>
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>

        {/* Billing org (read-only) */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white/80 p-3">
          <p className="text-sm font-medium text-gray-800">Billing Organization</p>
          <div className="mt-1 text-sm text-gray-700">
            {billingOrgName}
            {billingOrgStatus ? <span className="text-gray-500"> • {billingOrgStatus}</span> : null}
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {err}
          </div>
        ) : null}

        {/* Plans */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {(products ?? []).map((p) => {
              const price = p?.price;
              const amount = price?.formattedAmount ?? '';
              const interval = price?.interval ?? '';
              const priceId = price?.id;

              return (
                <div
                  key={p.id ?? priceId}
                  className="rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900">{p?.name ?? 'Plan'}</p>
                      {p?.description ? (
                        <p className="text-xs text-gray-600 mt-1 leading-5">{p.description}</p>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-gray-900">{amount}</div>
                      {interval ? (
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{interval}</div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-600">
                      Billing to <span className="font-medium">{billingOrgName}</span>
                    </div>

                    <button
                      type="button"
                      disabled={!priceId || checkoutBusy}
                      onClick={() => onPurchase(priceId)}
                      className="px-3 py-1.5 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium shadow hover:opacity-95 disabled:opacity-60"
                    >
                      {checkoutBusy ? 'Starting…' : 'Purchase'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}