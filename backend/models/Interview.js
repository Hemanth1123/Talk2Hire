// const mongoose = require("mongoose");

// const InterviewSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
//   topicName: { type: String, required: true },

//   scheduledDate: { type: Date, required: true },
//   scheduledTime: { type: String, required: true },

//   status: {
//     type: String,
//     enum: ["Pending", "Accepted", "Rejected", "Completed"],
//     default: "Pending",
//   },

//   points: { type: Number, default: null }, // Quiz score

//   feedback: {
//     score: { type: Number, default: 0 },
//     strengths: { type: [String], default: [] },
//     weaknesses: { type: [String], default: [] },
//     remarks: { type: String, default: "" },
//   },

//   bookedAt: { type: Date, default: Date.now },
//   completedAt: { type: Date },
//   createdAt: { type: Date, default: Date.now },

//   chatHistory: [
//     {
//       sender: { type: String },
//       message: { type: String },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
// });

// module.exports = mongoose.model("Interview", InterviewSchema);

const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  topicName: { type: String, required: true },

  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },

  //  Added: Exact datetime for system control
  scheduledAt: { type: Date },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "In-Progress", "Completed"],
    default: "Pending",
  },

  points: { type: Number, default: null },

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


//  AUTO-COMBINE DATE + TIME BEFORE SAVE
InterviewSchema.pre("save", function (next) {
  if (this.scheduledDate && this.scheduledTime) {
    const datePart = new Date(this.scheduledDate).toISOString().split("T")[0];
    this.scheduledAt = new Date(`${datePart}T${this.scheduledTime}:00`);
  }
  next();
});

module.exports = mongoose.model("Interview", InterviewSchema);
