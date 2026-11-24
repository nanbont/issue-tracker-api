const mongoose = require('mongoose');
const { Schema } = mongoose;


const commentSchema = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref: 'Issue', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: [true, 'Comment body is required'], trim: true, minlength: 1, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);