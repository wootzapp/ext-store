// components/settings/ProfileSection.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_AVATAR = '/icons/wootz.png';

const pickAvatarUrl = (u) =>
  u?.avatarUrl ||
  u?.avatar_url ||
  u?.image ||
  u?.picture ||
  u?.photoURL ||
  u?.profileImageUrl ||
  u?.profile_image_url ||
  null;

const getDisplayName = (u) =>
  u?.name || u?.login || u?.username || (u?.email ? u.email.split('@')[0] : '');

const getInitials = (nameLike) => {
  const name = (nameLike || '').trim();
  if (!name) return 'U';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || 'U';
};

export default function ProfileSection({ user }) {
  if (!user) return null;

  const [imgBroken, setImgBroken] = React.useState(false);
  const name = getDisplayName(user) || '—';
  const email = user?.email || '';

  // Match HomeHub precedence, with a default icon; if image fails, show initials.
  const candidate = pickAvatarUrl(user) || DEFAULT_AVATAR;
  const showImage = !!candidate && !imgBroken;

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
          {showImage ? (
            <img
              src={candidate}
              alt={name || 'User'}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
              onError={() => setImgBroken(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center font-semibold">
              {getInitials(name)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{name}</div>
            <div className="text-sm text-gray-600 truncate">{email}</div>
          </div>

          {user?.role && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}