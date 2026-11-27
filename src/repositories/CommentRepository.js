const Comment = require('../models/Comment');

const POPULATE = { path: 'author', select: 'name email role' };

class CommentRepository {
  create(data) { return Comment.create(data); }
  findById(id) { return Comment.findById(id).populate(POPULATE); }
  findByIdRaw(id) { return Comment.findById(id); }
  async listByIssue(issueId, { skip = 0, limit = 20 }) {
    const [items, total] = await Promise.all([
      Comment.find({ issue: issueId }).populate(POPULATE).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Comment.countDocuments({ issue: issueId }),
    ]);
    return { items, total };
  }
  updateById(id, data) { return Comment.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(POPULATE); }
  deleteById(id) { return Comment.findByIdAndDelete(id); }
  deleteByIssue(issueId) { return Comment.deleteMany({ issue: issueId }); }
  deleteByIssueIds(ids) { return Comment.deleteMany({ issue: { $in: ids } }); }
}

module.exports = CommentRepository;