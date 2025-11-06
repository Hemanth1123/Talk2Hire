// routes/aiQuizRouter.js

const express = require("express");
const { GoogleGenerativeAI } = require("@google/genai"); // Correct import with destructuring {}

const router = express.Router();

// --- Initialize the Google GenAI client ---
// This will only work if your GEMINI_API_KEY is correctly set in your .env file
let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.error("❌ FATAL ERROR: Failed to initialize GoogleGenerativeAI. Is GEMINI_API_KEY set in .env?", error);
  // We don't crash the whole app, but the endpoint will fail gracefully.
}


/**
 * @route   POST /api/aiQuiz/generate
 * @desc    Generate a 10-question MC quiz based on a course topic
 * @access  Public (add authentication middleware here if needed)
 */
router.post("/generate", async (req, res) => {
  // --- Pre-flight Check ---
  // Ensure the client was initialized correctly before proceeding.
  if (!genAI) {
    return res.status(500).json({
      success: false,
      message: "AI service is not configured correctly on the server.",
    });
  }

  // 1. Get the course topic from the request body
  const { course } = req.body;

  // 2. Validate the input
  if (!course || typeof course !== 'string' || course.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "A non-empty 'course' topic string is required in the request body.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // 3. Create a detailed, robust prompt asking for JSON output
    const prompt = `
      Generate 10 multiple-choice questions for a quiz on the topic of "${course}".

      RULES:
      1. Provide the output in a valid JSON array format.
      2. Do NOT include any text, explanation, or markdown formatting (like \`\`\`json) before or after the JSON array.
      3. Each object in the array must represent a question and have the following structure:
         - "question": A string for the question text.
         - "options": An array of exactly four strings.
         - "correctAnswer": A string that is an exact match to one of the items in the "options" array.
    `;

    // 4. Generate the content
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // 5. Clean and parse the JSON response
    // This handles cases where the model might still add markdown backticks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const quiz = JSON.parse(text);

    // 6. Send the structured quiz back to the client
    res.status(200).json({
      success: true,
      course: course,
      quiz: quiz,
    });

  } catch (error) {
    console.error("❌ AI Quiz Generation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI quiz. The model may have returned an invalid format or an API error occurred.",
    });
  }
});

module.exports = router;