const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: { type: String, required: [true, 'Project name is required'], trim: true, minlength: 2, maxlength: 100 },
    
    key: {
      type: String, required: true, unique: true, uppercase: true, trim: true,
      match: [/^[A-Z][A-Z0-9]{1,9}$/, 'Key must be 2-10 characters (A-Z, 0-9), starting with a letter'],
    },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);