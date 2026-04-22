const bcrypt = require('bcrypt');

const hashPassword = (plain) => bcrypt.hash(plain, 12);
const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
