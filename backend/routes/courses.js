const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const Course = require("../models/Course");

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add a course (Admin)
router.post(
  "/",
  auth,
  adminCheck,
  [check("name", "Course name required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, description } = req.body;
      let course = await Course.findOne({ name });
      if (course) return res.status(400).json({ msg: "Course already exists" });
      course = new Course({ name, description });
      await course.save();
      res.status(201).json({ success: true, data: course });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a course (Admin)
router.delete("/:id", auth, adminCheck, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: "Course not found" });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Course removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
