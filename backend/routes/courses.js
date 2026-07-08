const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Project = require('../models/Project');
const router = express.Router();

// Get courses by teacher
router.get('/', async (req, res) => {
  try {
    const { teacherId } = req.query;
    const filter = teacherId ? { teacherId } : {};
    const courses = await Course.find(filter);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// Get enrolled courses for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const courses = await Course.find({ enrolledStudents: studentId });
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    res.status(500).json({ message: 'Server error fetching student courses' });
  }
});

// Create a new course
router.post('/', async (req, res) => {
  try {
    const { title, teacherId, challenges } = req.body;
    const newCourse = new Course({
      title,
      teacherId,
      challenges: challenges || []
    });

    await newCourse.save();
    res.status(200).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error creating course' });
  }
});

// Update a course
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, challenges } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { title, challenges },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error updating course' });
  }
});

// Enroll in a course
router.post('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      await course.save();
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error enrolling in course' });
  }
});

// Kick a student from a course
router.post('/:id/kick', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // 1. Remove from enrolledStudents
    course.enrolledStudents = course.enrolledStudents.filter(sid => sid !== studentId);
    await course.save();

    // 2. Handle the student's active projects for this course
    const affectedProjects = await Project.find({
      courseId: id,
      $or: [
        { studentId: studentId },
        { members: studentId }
      ]
    });

    for (let project of affectedProjects) {
      if (project.studentId === studentId) {
        // Case A: Student is the Owner
        if (project.members && project.members.length > 0) {
          // Team project: Snapshot for the kicked student
          const clonedProject = new Project({
            ...project.toObject(),
            _id: new mongoose.Types.ObjectId(),
            studentId: studentId,
            members: [],
            isArchived: true
          });
          await clonedProject.save();

          // Transfer ownership of the live project to the first member
          project.studentId = project.members[0];
          project.members = project.members.filter(m => m !== project.studentId);
          await project.save();
        } else {
          // Solo project: Just archive it directly
          project.isArchived = true;
          await project.save();
        }
      } else if (project.members && project.members.includes(studentId)) {
        // Case B: Student is just a Member
        // Snapshot for the kicked student
        const clonedProject = new Project({
          ...project.toObject(),
          _id: new mongoose.Types.ObjectId(),
          studentId: studentId,
          members: [],
          isArchived: true
        });
        await clonedProject.save();

        // Remove from the live project
        project.members = project.members.filter(m => m !== studentId);
        await project.save();
      }
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error kicking from course:', error);
    res.status(500).json({ message: 'Server error kicking from course' });
  }
});

// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
});

module.exports = router;
