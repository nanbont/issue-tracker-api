const mongoose = require('mongoose');
const { ROLES } = require('./constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is not valid'],
    },
    // Only the bcrypt hash is stored, and it is excluded from queries by default.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.MEMBER },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; },
});

module.exports = mongoose.model('User', userSchema);