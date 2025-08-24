const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  ownerId: { type: String, required: true },
  members: [{
    username: { type: String, required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  sharedSchemas: [{
    schemaId: { type: String, required: true },
    name: { type: String, required: true },
    scripts: { type: String, required: true },
    lastModified: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
WorkspaceSchema.index({ id: 1 });
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.username': 1 });

module.exports = mongoose.model('Workspace', WorkspaceSchema);