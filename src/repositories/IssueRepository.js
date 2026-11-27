const Issue = require('../models/Issue');

const POPULATE = [
  { path: 'reporter', select: 'name email' },
  { path: 'assignee', select: 'name email' },
  { path: 'labels', select: 'name color' },
  { path: 'project', select: 'name key' },
];

class IssueRepository {
  create(data) { return Issue.create(data); }
  findById(id) { return Issue.findById(id).populate(POPULATE); }
  findByIdRaw(id) { return Issue.findById(id); }
  updateById(id, data) { return Issue.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(POPULATE); }
  deleteById(id) { return Issue.findByIdAndDelete(id); }

  async list({ filter = {}, skip = 0, limit = 20, sort = { createdAt: -1 } }) {
    const [items, total] = await Promise.all([
      Issue.find(filter).populate(POPULATE).sort(sort).skip(skip).limit(limit),
      Issue.countDocuments(filter),
    ]);
    return { items, total };
  }

  idsByProject(projectId) { return Issue.find({ project: projectId }).select('_id'); }
  deleteByProject(projectId) { return Issue.deleteMany({ project: projectId }); }
  unassignUserInProject(projectId, userId) {
    return Issue.updateMany({ project: projectId, assignee: userId }, { $set: { assignee: null } });
  }
  unassignUserEverywhere(userId) { return Issue.updateMany({ assignee: userId }, { $set: { assignee: null } }); }
  pullLabel(labelId) { return Issue.updateMany({ labels: labelId }, { $pull: { labels: labelId } }); }
  addAttachment(id, attachment) {
    return Issue.findByIdAndUpdate(id, { $push: { attachments: attachment } }, { new: true, runValidators: true }).populate(POPULATE);
  }
  async removeAttachment(id, attachmentId) {
    const issue = await Issue.findById(id);
    issue.attachments = issue.attachments.filter((a) => String(a._id) !== String(attachmentId));
    await issue.save();
    return this.findById(id);
  }
}

module.exports = IssueRepository;