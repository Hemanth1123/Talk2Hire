

const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const adminCheck = require("../middleware/adminCheck");
const Interview = require("../models/Interview");
const Topic = require("../models/Topic");

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// --- Book a slot ---
router.post(
  "/",
  auth,
  [
    check("topicName", "Topic required").not().isEmpty(),
    check("date", "Valid date required").isISO8601().toDate(),
    check("time", "Valid time required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { topicName, date, time } = req.body;

    try {
      let topic = await Topic.findOne({ name: topicName.trim() });
      if (!topic) {
        topic = new Topic({ name: topicName.trim() });
        await topic.save();
      }

      const newInterview = new Interview({
        user: req.user.id,
        topic: topic._id,
        topicName: topic.name,
        scheduledDate: date,
        scheduledTime: time,
        status: "Pending",
        bookedAt: new Date(),
      });

      const interview = await newInterview.save();

      res.status(201).json({
        success: true,
        message: "Interview booked successfully",
        data: await interview.populate("topic", "name"),
      });
    } catch (err) {
      console.error("Error booking interview:", err);
      res.status(500).send("Server Error");
    }
  }
);

// --- Get all interviews (admin) ---
router.get("/admin", auth, adminCheck, async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("user", "username email")
      .populate("topic", "name")
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      total: interviews.length,
      data: interviews.map((i) => ({
        id: i._id,
        user: i.user,
        topicName: i.topicName || i.topic?.name,
        scheduledDate: i.scheduledDate,
        scheduledTime: i.scheduledTime,
        bookedAt: i.bookedAt,
        status: i.status,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- Get user history (with points) ---
router.get("/user", auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .populate("topic", "name")
      .sort({ scheduledDate: -1 });

    res.json({
      success: true,
      total: interviews.length,
      data: interviews.map((i) => ({
        id: i._id,
        topicName: i.topicName || i.topic?.name,
        scheduledDate: i.scheduledDate,
        scheduledTime: i.scheduledTime,
        bookedAt: i.bookedAt,
        status: i.status,
        points: i.points ?? null, // ✅ Include points in response
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Middleware to validate ID in params
const validateInterviewId = (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Interview ID is required" });
  if (!isValidObjectId(id))
    return res.status(400).json({ error: "Invalid Interview ID" });
  next();
};

// --- Accept interview (admin) ---
router.patch(
  "/:id/accept",
  auth,
  adminCheck,
  validateInterviewId,
  async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.id);
      if (!interview)
        return res.status(404).json({ msg: "Interview not found" });

      interview.status = "Accepted";
      interview.reviewedAt = new Date();
      await interview.save();
      res.json({ success: true, data: interview });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// --- Reject interview (admin) ---
router.patch(
  "/:id/reject",
  auth,
  adminCheck,
  validateInterviewId,
  async (req, res) => {
    try {
      const interview = await Interview.findById(req.params.id);
      if (!interview)
        return res.status(404).json({ msg: "Interview not found" });

      interview.status = "Rejected";
      interview.reviewedAt = new Date();
      await interview.save();
      res.json({ success: true, data: interview });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// --- Start AI Interview ---
// router.post("/:id/start", auth, validateInterviewId, async (req, res) => {
//   try {
//     const interview = await Interview.findById(req.params.id).populate(
//       "topic",
//       "name"
//     );
//     if (!interview) return res.status(404).json({ msg: "Interview not found" });
//     if (interview.user.toString() !== req.user.id)
//       return res.status(401).json({ msg: "Not authorized" });

//     const initialGreeting = `Hello, welcome to your ${interview.topic.name} interview. Tell me about yourself.`;
//     interview.chatHistory.push({ sender: "ai", message: initialGreeting });
//     await interview.save();

//     res.json({
//       success: true,
//       text: initialGreeting,
//       audio: "PLACEHOLDER_AUDIO_BASE64",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// });

router.post("/:id/start", auth, validateInterviewId, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("topic", "name");
    if (!interview) return res.status(404).json({ msg: "Interview not found" });

    if (interview.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    if (interview.status !== "Accepted")
      return res.status(400).json({ msg: "Interview not approved yet" });

    const scheduledAt = getScheduledDateTime(interview);
    const now = new Date();

    // ⏰ Allow starting 10 minutes before slot
    const startWindow = new Date(scheduledAt.getTime() - 10 * 60000);

    // ⏰ Interview expires 1 hour after slot time
    const endWindow = new Date(scheduledAt.getTime() + 60 * 60000);

    if (now < startWindow) {
      return res.status(400).json({
        msg: "Interview has not started yet",
        scheduledTime: scheduledAt,
      });
    }

    if (now > endWindow) {
      return res.status(400).json({ msg: "Interview time expired" });
    }

    interview.status = "In-Progress";

    const initialGreeting = `Hello, welcome to your ${interview.topic.name} interview. Tell me about yourself.`;

    interview.chatHistory.push({ sender: "ai", message: initialGreeting });
    await interview.save();

    res.json({
      success: true,
      text: initialGreeting,
      audio: "PLACEHOLDER_AUDIO_BASE64",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// --- Interact in AI interview ---
router.post("/:id/interact", auth, validateInterviewId, async (req, res) => {
  const { text: userMessage } = req.body;
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ msg: "Interview not found" });

    interview.chatHistory.push({ sender: "user", message: userMessage });

    const followUps = [
      "Can you elaborate on that?",
      "What is your biggest strength in this area?",
      "Describe a challenging situation you faced.",
      "Where do you see yourself in 5 years?",
    ];
    const aiResponse = followUps[Math.floor(Math.random() * followUps.length)];

    interview.chatHistory.push({ sender: "ai", message: aiResponse });
    await interview.save();

    res.json({
      success: true,
      text: aiResponse,
      audio: "PLACEHOLDER_AUDIO_BASE64",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- Complete interview ---
router.post("/:id/complete", auth, validateInterviewId, async (req, res) => {
  const { score, strengths = [], weaknesses = [], remarks = "" } = req.body;
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ msg: "Interview not found" });

    interview.status = "Completed";
    interview.feedback = { score, strengths, weaknesses, remarks };
    interview.completedAt = new Date();
    await interview.save();

    res.json({ success: true, data: interview });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- Get single interview ---
router.get("/:id", auth, validateInterviewId, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate(
      "topic",
      "name"
    );
    if (!interview) return res.status(404).json({ msg: "Interview not found" });

    if (interview.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json({ success: true, data: interview });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// Delete interview by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("🗑 Delete request received for ID:", req.params.id);
    console.log("👤 User ID:", req.user.id);

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      console.log("❌ Interview not found");
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      console.log("🚫 Unauthorized delete attempt");
      return res.status(403).json({ message: "Not authorized" });
    }

    await interview.deleteOne();
    console.log("✅ Interview deleted successfully");
    res.json({ message: "Interview deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting interview:", err);
    res.status(500).json({ message: "Server error while deleting interview" });
  }
});


// --- Submit points ---
// --- Submit user points (update score after quiz completion) ---
router.patch("/:id/submit", auth, validateInterviewId, async (req, res) => {
  try {
    const { points } = req.body;

    if (points === undefined || points === null) {
      return res.status(400).json({ error: "Points value is required" });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Ensure the logged-in user owns this interview
    if (interview.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this interview" });
    }

    // Update score and mark completion
    interview.points = points;
    interview.status = "Completed";
    interview.completedAt = new Date();

    await interview.save();

    res.json({
      success: true,
      message: "✅ Points updated successfully",
      data: interview,
    });
  } catch (err) {
    console.error("❌ Error submitting points:", err.message);
    res.status(500).json({ error: "Failed to submit points" });
  }
});

module.exports = router;
