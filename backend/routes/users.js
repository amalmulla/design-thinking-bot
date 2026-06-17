const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Excluding password
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.put('/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    user.blocked = !user.blocked;
    await user.save();

    res.status(200).json({ message: `User block status changed to ${user.blocked}`, user: { id: user._id, blocked: user.blocked } });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.status(500).json({ message: 'Server error modifying user block state' });
  }
});

router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Student', 'Teacher'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be Student or Teacher.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: `User role updated to ${user.role}`, user: { id: user._id, role: user.role } });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

router.put('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Re-sign token with new name
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Profile updated successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

module.exports = router;
