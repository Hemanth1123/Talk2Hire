const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  topicName: { type: String, required: true },

  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed"],
    default: "Pending",
  },

  points: { type: Number, default: null }, // Quiz score

  feedback: {
    score: { type: Number, default: 0 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    remarks: { type: String, default: "" },
  },

  bookedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },

  chatHistory: [
    {
      sender: { type: String },
      message: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Interview", InterviewSchema);
