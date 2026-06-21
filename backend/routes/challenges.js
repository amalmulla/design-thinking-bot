const express = require('express');
const Challenge = require('../models/Challenge');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = teacherId ? { createdByTeacherId: teacherId } : {};
    const challenges = await Challenge.find(filter);
    res.status(200).json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Server error fetching challenges' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, createdByTeacherId, status } = req.body;
    const newChallenge = new Challenge({
      title,
      description,
      createdByTeacherId,
      status: status || 'Active'
    });

    await newChallenge.save();
    res.status(200).json(newChallenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Server error creating challenge' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      id,
      { title, description, status },
      { new: true }
    );

    if (!updatedChallenge) {
      return res.status(400).json({ message: 'Challenge not found.' });
    }

    res.status(200).json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Server error updating challenge' });
  }
});

module.exports = router;
