const AppError = require('../utils/AppError');
const { ROLES } = require('../models/constants');


function idOf(value) {
  if (value && value._id) {
    return String(value._id);
  }
  return String(value);
}

function isAdmin(user) {
  return user.role === ROLES.ADMIN;
}

function isOwner(project, user) {
  return idOf(project.owner) === idOf(user._id);
}

function isMember(project, user) {
  if (isOwner(project, user)) {
    return true;
  }
  for (const member of project.members) {
    if (idOf(member) === idOf(user._id)) {
      return true;
    }
  }
  return false;
}

/** Admin, or the Project Manager who owns the project. */
function canManageProject(project, user) {
  if (isAdmin(user)) {
    return true;
  }
  return user.role === ROLES.PROJECT_MANAGER && isOwner(project, user);
}

function canViewProject(project, user) {
  return isAdmin(user) || isMember(project, user);
}

function assertCanView(project, user) {
  // 404 (not 403) for outsiders so the existence of private projects is not revealed
  if (!canViewProject(project, user)) {
    throw AppError.notFound('Project not found');
  }
}

function assertCanManage(project, user) {
  assertCanView(project, user);
  if (!canManageProject(project, user)) {
    throw AppError.forbidden('Only the project manager who owns this project (or an administrator) can do this');
  }
}

module.exports = { idOf, isAdmin, isOwner, isMember, canManageProject, canViewProject, assertCanView, assertCanManage };