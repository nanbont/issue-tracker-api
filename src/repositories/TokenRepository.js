const RevokedToken = require('../models/RevokedToken');

class TokenRepository {
  revoke(jti, expiresAt) { return RevokedToken.updateOne({ jti }, { jti, expiresAt }, { upsert: true }); }
  async isRevoked(jti) { return !!(await RevokedToken.exists({ jti })); }
  purgeExpired() { return RevokedToken.deleteMany({ expiresAt: { $lt: new Date() } }); }
}

module.exports = TokenRepository;