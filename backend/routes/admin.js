const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const User = require("../models/User");
const Interview = require("../models/Interview");
const Course = require("../models/Course");

router.get("/dashboard", auth, adminCheck, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalInterviews = await Interview.countDocuments();
    const pending = await Interview.countDocuments({ status: "Pending" });
    const completed = await Interview.countDocuments({ status: "Completed" });

    res.json({
      success: true,
      data: { totalUsers, totalCourses, totalInterviews, pending, completed }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
