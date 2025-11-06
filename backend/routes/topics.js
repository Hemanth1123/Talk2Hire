const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const Topic = require("../models/Topic");

// Get list
router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find().sort({ name: 1 });
    res.json({ success: true, data: topics });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Add topic (admin)
router.post(
  "/",
  auth,
  adminCheck,
  [check("name", "Topic name is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name } = req.body;
      let topic = await Topic.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (topic) return res.status(400).json({ msg: "Topic already exists" });
      topic = new Topic({ name });
      await topic.save();
      res.status(201).json({ success: true, data: topic });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// Delete topic (admin)
router.delete("/:id", auth, adminCheck, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ msg: "Topic not found" });
    await Topic.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Topic removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
