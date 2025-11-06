// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const aiQuizRouter = require("./routes/aiQuizRouter");



// Import AI Quiz router


const app = express();
const PORT = process.env.PORT || 6000;

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected..."))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// --- CORS Setup ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// --- JSON Parser ---
app.use(express.json());

// --- API Routes ---
// Make sure these routes exist; otherwise remove or comment out
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/interviews", require("./routes/interviews"));
app.use("/api/topics", require("./routes/topics"));
app.use("/api/quiz", aiQuizRouter);

// --- Root Test Route ---
app.get("/", (req, res) => res.send("🚀 API running successfully..."));

// --- Start Server ---
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

