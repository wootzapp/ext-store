// components/settings/ProfileSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');
};

export default function ProfileSection({ user }) {
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-2 max-w-full"
    >
      <h2 className="text-lg font-medium text-gray-800 mb-4">Profile</h2>

      <div className="p-4 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center font-semibold">
              {getInitials(user.name)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {user.name || '—'}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {user.email || ''}
            </div>
          </div>

          {user.role && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
              {user.role}
            </span>
          )}
        </div>
        {/* Intentionally no extra rows: no User ID, no Organization ID, etc. */}
      </div>
    </motion.div>
  );
}