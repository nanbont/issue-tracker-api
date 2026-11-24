const mongoose = require('mongoose');
const { Schema } = mongoose;

const labelSchema = new Schema(
  {
    name: { type: String, required: [true, 'Label name is required'], trim: true, lowercase: true, minlength: 1, maxlength: 30 },
    color: { type: String, default: '#808080', match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #ff0000'] },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  },
  { timestamps: true }
);


labelSchema.index({ project: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Label', labelSchema);