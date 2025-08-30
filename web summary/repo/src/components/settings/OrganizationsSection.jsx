// src/components/settings/OrganizationsSection.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizationsSection({
  loading,
  error,
  user,
  organizations = [],
  onManageClick,
}) {
  const [showAll, setShowAll] = React.useState(false);

  const formatDMY = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return iso;
    }
  };

  const RolePill = ({ role }) =>
    role ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
        {role}
      </span>
    ) : null;

  const StatusPill = ({ isActive, status }) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}
    >
      {status || (isActive ? 'active' : 'inactive')}
    </span>
  );

  if (loading) {
    return (
      <div className="w-full min-w-0">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Organizations</h2>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-w-0">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Organizations</h2>
        <div className="p-4 rounded-xl border border-gray-200 bg-white">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const selectedId = user?.selectedOrganizationId ?? null;
  const currentOrg =
    organizations.find((o) => Number(o.id) === Number(selectedId)) ||
    organizations[0] ||
    null;

  const otherOrgs =
    (currentOrg
      ? organizations.filter((o) => Number(o.id) !== Number(currentOrg.id))
      : organizations) || [];

  return (
    <div className="w-full min-w-0">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Organizations</h2>

      {/* Current organization card */}
      <div className="p-4 rounded-xl border border-gray-200 bg-white w-full min-w-0">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-sm text-gray-500">Current organization</div>
            {currentOrg ? (
              <>
                <div className="font-semibold text-gray-900 truncate" title={currentOrg.name}>
                  {currentOrg.name || `Organization`}
                </div>
                {currentOrg.joinedAt && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    Joined: {formatDMY(currentOrg.joinedAt)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-700">—</div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentOrg?.role && <RolePill role={currentOrg.role} />}
            {String(currentOrg?.role || '').toLowerCase() === 'owner' && (
              <button
                type="button"
                onClick={onManageClick}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium hover:from-red-600 hover:to-orange-600 shadow"
              >
                Manage
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        {currentOrg && <div className="mt-4 pt-4 border-t border-gray-200" />}

        {/* Plan details — ONLY user-relevant fields */}
        {currentOrg && (
          <div className="mt-1 min-w-0">
            <div className="text-sm text-gray-500 mb-2">Plan</div>
            <div className="grid gap-2 sm:grid-cols-2 text-sm min-w-0">
              <div className="text-gray-700 min-w-0">
                <span className="text-gray-500">Status:</span>{' '}
                <StatusPill
                  isActive={!!currentOrg.isActive}
                  status={currentOrg.subscriptionStatus}
                />
              </div>
              <div className="text-gray-700 min-w-0">
                <span className="text-gray-500">Type:</span>{' '}
                {currentOrg.subscriptionType || '—'}
              </div>
            </div>
          </div>
        )}

        {/* Toggle link for other orgs */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
          >
            {showAll ? 'Hide organizations' : 'View all organizations'}
          </button>
        </div>

        {/* Other organizations */}
        <AnimatePresence initial={false}>
          {showAll && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-4 grid gap-3 w-full min-w-0"
            >
              {otherOrgs.length === 0 ? (
                <div className="text-sm text-gray-600">No other organizations.</div>
              ) : (
                otherOrgs.map((org) => (
                  <div
                    key={org.id}
                    className="rounded-lg border border-gray-200 p-4 w-full min-w-0 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div
                          className="font-medium text-gray-900 truncate"
                          title={org.name}
                        >
                          {org.name || `Organization`}
                        </div>
                        {org.joinedAt && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Joined: {formatDMY(org.joinedAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {org.role && <RolePill role={org.role} />}
                        {String(org.role).toLowerCase() === 'owner' && (
                          <button
                            type="button"
                            onClick={onManageClick}
                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium hover:from-red-600 hover:to-orange-600 shadow"
                          >
                            Manage
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 min-w-0">
                      <div className="text-sm text-gray-500 mb-2">Plan</div>
                      <div className="grid gap-2 sm:grid-cols-2 text-sm min-w-0">
                        <div className="text-gray-700 min-w-0">
                          <span className="text-gray-500">Status:</span>{' '}
                          <StatusPill
                            isActive={!!org.isActive}
                            status={org.subscriptionStatus}
                          />
                        </div>
                        <div className="text-gray-700 min-w-0">
                          <span className="text-gray-500">Type:</span>{' '}
                          {org.subscriptionType || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}