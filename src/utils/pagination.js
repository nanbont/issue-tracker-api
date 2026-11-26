
const toSkipLimit = ({ page = 1, limit = 20 } = {}) => ({ skip: (page - 1) * limit, limit });
const meta = ({ page = 1, limit = 20 } = {}, total) => ({ page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
module.exports = { toSkipLimit, meta };