const Project = require('../models/Project');

class ProjectRepository {
  create(data) { return Project.create(data); }
  findById(id) { return Project.findById(id).populate('owner members', 'name email role'); }
  findByIdRaw(id) { return Project.findById(id); }
  async list({ filter = {}, skip = 0, limit = 20 }) {
    const [items, total] = await Promise.all([
      Project.find(filter).populate('owner', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);
    return { items, total };
  }
  
  async idsVisibleTo(userId) {
    const rows = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    return rows.map((r) => r._id);
  }
  updateById(id, data) {
    return Project.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner members', 'name email role');
  }
  addMember(id, userId) {
    return Project.findByIdAndUpdate(id, { $addToSet: { members: userId } }, { new: true }).populate('owner members', 'name email role');
  }
  removeMember(id, userId) {
    return Project.findByIdAndUpdate(id, { $pull: { members: userId } }, { new: true }).populate('owner members', 'name email role');
  }
  deleteById(id) { return Project.findByIdAndDelete(id); }
  findByOwner(userId) { return Project.find({ owner: userId }).select('_id'); }
  removeMemberEverywhere(userId) { return Project.updateMany({ members: userId }, { $pull: { members: userId } }); }
}

module.exports = ProjectRepository;