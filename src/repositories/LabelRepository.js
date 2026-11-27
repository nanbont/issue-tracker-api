const Label = require('../models/Label');

class LabelRepository {
  create(data) { return Label.create(data); }
  findById(id) { return Label.findById(id); }
  findByProject(projectId) { return Label.find({ project: projectId }).sort({ name: 1 }); }
  findByIds(ids) { return Label.find({ _id: { $in: ids } }); }
  findByName(name, projectIds) {
    const filter = { name: String(name).toLowerCase() };
    if (projectIds) filter.project = { $in: projectIds };
    return Label.find(filter).select('_id');
  }
  updateById(id, data) { return Label.findByIdAndUpdate(id, data, { new: true, runValidators: true }); }
  deleteById(id) { return Label.findByIdAndDelete(id); }
  deleteByProject(projectId) { return Label.deleteMany({ project: projectId }); }
}

module.exports = LabelRepository;