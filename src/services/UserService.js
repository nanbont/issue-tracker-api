const AppError = require('../utils/AppError');
const { ROLES } = require('../models/constants');
const { toSkipLimit, meta } = require('../utils/pagination');


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class UserService {
  constructor({ userRepository, projectRepository, issueRepository }) {
    this.users = userRepository;
    this.projects = projectRepository;
    this.issues = issueRepository;
  }

  async list(query) {
    const filter = {};
    if (query.role) {
      filter.role = query.role;
    }
    if (query.q) {
      const search = { $regex: escapeRegex(query.q), $options: 'i' };
      filter.$or = [{ name: search }, { email: search }];
    }
    const { skip, limit } = toSkipLimit(query);
    const { items, total } = await this.users.list({ filter, skip, limit });
    return { items, meta: meta(query, total) };
  }

  async get(id) {
    const user = await this.users.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async update(actor, id, data) {
    await this.get(id);
    const isChangingOwnRole = data.role && String(actor._id) === String(id);
    if (isChangingOwnRole && data.role !== ROLES.ADMIN) {
      throw AppError.badRequest('Administrators cannot remove their own admin role');
    }
    return this.users.updateById(id, data);
  }

  async remove(actor, id) {
    const target = await this.get(id);

    if (String(actor._id) === String(id)) {
      throw AppError.badRequest('You cannot delete your own account');
    }

    const ownedProjects = await this.projects.findByOwner(id);
    if (ownedProjects.length > 0) {
      throw AppError.conflict('User still owns projects. Delete the projects first.');
    }

    if (target.role === ROLES.ADMIN) {
      const adminCount = await this.users.countByRole(ROLES.ADMIN);
      if (adminCount <= 1) {
        throw AppError.conflict('Cannot delete the last administrator');
      }
    }

    await this.projects.removeMemberEverywhere(id);
    await this.issues.unassignUserEverywhere(id);
    await this.users.deleteById(id);
  }
}

module.exports = UserService;