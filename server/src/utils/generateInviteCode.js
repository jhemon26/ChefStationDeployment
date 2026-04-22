const crypto = require('crypto');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'CHEF-';
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) out += chars[bytes[i] % chars.length];
  return out;
};

module.exports = { generateInviteCode };
