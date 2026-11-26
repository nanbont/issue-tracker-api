const User = require('../models/User');


class UserRepository {
  create(data) { return User.create(data); }
  findById(id) { return User.findById(id); }
  findByEmail(email) { return User.findOne({ email }); }
  findByEmailWithPassword(email) { return User.findOne({ email }).select('+passwordHash'); }
  findByIds(ids) { return User.find({ _id: { $in: ids } }); }
  async list({ filter = {}, skip = 0, limit = 20 } = {}) {
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return { items, total };
  }
  async updateById(id, data) {
    await User.updateOne({ _id: id }, data, { runValidators: true });
    return User.findById(id);
  }
  deleteById(id) { return User.deleteOne({ _id: id }); }
  countByRole(role) { return User.countDocuments({ role }); }
}

module.exports = UserRepository;