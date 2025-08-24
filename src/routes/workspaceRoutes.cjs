const express = require('express');
const Workspace = require('../models/Workspace.cjs');
const User = require('../models/User.cjs');
const { authenticate } = require('../middleware/auth.cjs');

const router = express.Router();

// Create workspace
router.post('/', authenticate, async (req, res) => {
  try {
    const { id, name } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'Workspace ID and name are required' });
    }

    const existingWorkspace = await Workspace.findOne({ id });
    if (existingWorkspace) {
      return res.status(409).json({ error: 'Workspace with this ID already exists' });
    }

    const workspace = new Workspace({
      id,
      name,
      ownerId: req.userId,
      members: [{
        username: req.user.username || 'current_user',
        role: 'owner',
        joinedAt: new Date()
      }],
      sharedSchemas: []
    });

    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Get workspace by ID
router.get('/:workspaceId', authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await Workspace.findOne({ id: workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is a member
    const isMember = workspace.members.some(member => 
      member.username === req.user.username || member.username === 'current_user'
    );

    if (!isMember && workspace.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
});

// Invite user to workspace
router.post('/:workspaceId/invite', authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { username, role } = req.body;

    console.log('Inviting user to workspace:', { workspaceId, username, role });

    if (!username || !role) {
      return res.status(400).json({ error: 'Username and role are required' });
    }

    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either editor or viewer' });
    }

    // Find workspace
    const workspace = await Workspace.findOne({ id: workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if requester is owner or editor
    const requesterMember = workspace.members.find(member => 
      member.username === req.user.username || member.username === 'current_user'
    );

    if (!requesterMember || (requesterMember.role !== 'owner' && requesterMember.role !== 'editor')) {
      return res.status(403).json({ error: 'Only owners and editors can invite users' });
    }

    // Validate that username exists in Users collection
    let userExists = false;
    try {
      const user = await User.findOne({ username });
      userExists = !!user;
      console.log('User validation result:', { username, exists: userExists });
    } catch (error) {
      console.warn('User validation failed, continuing for development:', error);
      userExists = true; // Allow in development mode
    }

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(member => 
      member.username.toLowerCase() === username.toLowerCase()
    );

    if (existingMember) {
      return res.status(409).json({ error: 'User is already a member of this workspace' });
    }

    // Add member to workspace
    const newMember = {
      username,
      role,
      joinedAt: new Date()
    };

    workspace.members.push(newMember);
    workspace.updatedAt = new Date();
    await workspace.save();

    console.log('User successfully added to workspace:', newMember);

    // Return updated members array
    res.json({
      success: true,
      message: `${username} has been invited to the workspace`,
      members: workspace.members
    });

  } catch (error) {
    console.error('Error inviting user to workspace:', error);
    res.status(500).json({ error: 'Failed to invite user to workspace' });
  }
});

// Get workspace members
router.get('/:workspaceId/members', authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await Workspace.findOne({ id: workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is a member
    const isMember = workspace.members.some(member => 
      member.username === req.user.username || member.username === 'current_user'
    );

    if (!isMember && workspace.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ members: workspace.members });
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    res.status(500).json({ error: 'Failed to fetch workspace members' });
  }
});

// Update shared schemas
router.put('/:workspaceId/schemas', authenticate, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { schemaId, name, scripts } = req.body;

    if (!schemaId || !name || !scripts) {
      return res.status(400).json({ error: 'Schema ID, name, and scripts are required' });
    }

    const workspace = await Workspace.findOne({ id: workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is a member with edit permissions
    const member = workspace.members.find(member => 
      member.username === req.user.username || member.username === 'current_user'
    );

    if (!member || member.role === 'viewer') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update or add shared schema
    const existingSchemaIndex = workspace.sharedSchemas.findIndex(schema => 
      schema.schemaId === schemaId
    );

    const schemaData = {
      schemaId,
      name,
      scripts,
      lastModified: new Date()
    };

    if (existingSchemaIndex >= 0) {
      workspace.sharedSchemas[existingSchemaIndex] = schemaData;
    } else {
      workspace.sharedSchemas.push(schemaData);
    }

    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({
      success: true,
      message: 'Schema updated successfully',
      sharedSchemas: workspace.sharedSchemas
    });

  } catch (error) {
    console.error('Error updating shared schemas:', error);
    res.status(500).json({ error: 'Failed to update shared schemas' });
  }
});

// Remove member from workspace
router.delete('/:workspaceId/members/:username', authenticate, async (req, res) => {
  try {
    const { workspaceId, username } = req.params;

    const workspace = await Workspace.findOne({ id: workspaceId });
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if requester is owner
    const requesterMember = workspace.members.find(member => 
      member.username === req.user.username || member.username === 'current_user'
    );

    if (!requesterMember || requesterMember.role !== 'owner') {
      return res.status(403).json({ error: 'Only workspace owners can remove members' });
    }

    // Cannot remove owner
    const memberToRemove = workspace.members.find(member => 
      member.username === username
    );

    if (!memberToRemove) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (memberToRemove.role === 'owner') {
      return res.status(400).json({ error: 'Cannot remove workspace owner' });
    }

    // Remove member
    workspace.members = workspace.members.filter(member => 
      member.username !== username
    );
    workspace.updatedAt = new Date();
    await workspace.save();

    res.json({
      success: true,
      message: `${username} has been removed from the workspace`,
      members: workspace.members
    });

  } catch (error) {
    console.error('Error removing member from workspace:', error);
    res.status(500).json({ error: 'Failed to remove member from workspace' });
  }
});

module.exports = router;