const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ISSUE_STATUSES, ISSUE_PRIORITIES } = require('./constants');


const attachmentSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true, maxlength: 255 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    mimeType: { type: String, trim: true, maxlength: 100 },
    size: { type: Number, min: 0, max: 10 * 1024 * 1024 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const issueSchema = new Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    status: { type: String, enum: ISSUE_STATUSES, default: 'open', index: true },
    priority: { type: String, enum: ISSUE_PRIORITIES, default: 'medium' },
    
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    labels: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
    
    attachments: { type: [attachmentSchema], default: [] },
  },
  { timestamps: true }
);

issueSchema.index({ project: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Issue', issueSchema);