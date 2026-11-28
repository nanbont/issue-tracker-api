const AppError = require('../utils/AppError');
const policy = require('./accessPolicy');
const { toSkipLimit, meta } = require('../utils/pagination');


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class ProjectService {
  constructor({ projectRepository, userRepository, issueRepository, commentRepository, labelRepository }) {
    this.projects = projectRepository;
    this.users = userRepository;
    this.issues = issueRepository;
    this.comments = commentRepository;
    this.labels = labelRepository;
  }

 
  async list(user, query) {
    let filter;
    if (policy.isAdmin(user)) {
      filter = {};
    } else {
      filter = { $or: [{ owner: user._id }, { members: user._id }] };
    }
    if (query.q) {
      filter.name = { $regex: escapeRegex(query.q), $options: 'i' };
    }
    const { skip, limit } = toSkipLimit(query);
    const { items, total } = await this.projects.list({ filter, skip, limit });
    return { items, meta: meta(query, total) };
  }

  async get(user, id) {
    const project = await this.projects.findById(id);
    if (!project) {
      throw AppError.notFound('Project not found');
    }
    policy.assertCanView(project, user);
    return project;
  }

  async create(user, data) {
    try {
      const project = await this.projects.create({ ...data, owner: user._id, members: [user._id] });
      return this.projects.findById(project._id);
    } catch (error) {
      if (error.code === 11000) {
        throw AppError.conflict(`Project key '${data.key}' is already in use`);
      }
      throw error;
    }
  }

  async update(user, id, data) {
    const project = await this.get(user, id);
    policy.assertCanManage(project, user);
    return this.projects.updateById(id, data);
  }

 
  async remove(user, id) {
    const project = await this.get(user, id);
    policy.assertCanManage(project, user);

    const issues = await this.issues.idsByProject(id);
    const issueIds = [];
    for (const issue of issues) {
      issueIds.push(issue._id);
    }

    await this.comments.deleteByIssueIds(issueIds);
    await this.issues.deleteByProject(id);
    await this.labels.deleteByProject(id);
    await this.projects.deleteById(id);
  }

  async addMember(user, id, userId) {
    const project = await this.get(user, id);
    policy.assertCanManage(project, user);
    const newMember = await this.users.findById(userId);
    if (!newMember) {
      throw AppError.notFound('User not found');
    }
    return this.projects.addMember(id, userId);
  }

  async removeMember(user, id, userId) {
    const project = await this.get(user, id);
    policy.assertCanManage(project, user);
    if (policy.idOf(project.owner) === String(userId)) {
      throw AppError.badRequest('The project owner cannot be removed');
    }
    await this.issues.unassignUserInProject(id, userId);
    return this.projects.removeMember(id, userId);
  }
}

module.exports = ProjectService;