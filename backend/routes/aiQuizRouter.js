// // routes/aiQuizRouter.js
// const express = require("express");
// const router = express.Router();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // Initialize Gemini client
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// router.post("/generate", async (req, res) => {
//   const { course } = req.body;

//   if (!course) {
//     return res.status(400).json({
//       success: false,
//       message: "Course topic is required.",
//     });
//   }

//   // ✅ Try the latest model, fallback if needed
//   const modelNames = "gemini-2.5-flash";
//   let model;

//   for (const name of modelNames) {
//     try {
//       model = genAI.getGenerativeModel({ model: name });
//       console.log(`✅ Using model: ${name}`);
//       break;
//     } catch (err) {
//       console.warn(`⚠️ Model ${name} not available, trying next...`);
//     }
//   }

//   if (!model) {
//     return res.status(500).json({
//       success: false,
//       message: "No available Gemini model found for this API key.",
//     });
//   }

//   try {
//     const prompt = `
//       Generate 10 multiple-choice questions for a quiz on "${course}".
//       Return only valid JSON (no markdown or extra text).
//       Each object must look like:
//       {
//         "question": "Question text",
//         "options": ["A", "B", "C", "D"],
//         "correctAnswer": "A"
//       }
//     `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text().trim();

//     const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
//     let quiz;

//     try {
//       quiz = JSON.parse(cleaned);
//     } catch (err) {
//       console.error("❌ JSON Parse Error:", err);
//       return res.status(500).json({
//         success: false,
//         message: "AI returned invalid JSON. Try again.",
//       });
//     }

//     res.status(200).json({ success: true, course, quiz });
//   } catch (error) {
//     console.error("❌ AI Quiz Generation Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate AI quiz. Please try again later.",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;



// Import required modules
// // routes/aiQuizRouter.js
const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
require('dotenv').config(); // Load environment variables from .env file

// Initialize router
const router = express.Router();

// Get API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: GEMINI_API_KEY environment variable not set.');
  process.exit(1); // Exit if API key is missing
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(apiKey);

// Use a model version that supports JSON output and schema
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-09-2025',
});

// Define the safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Define the exact JSON schema we want the model to return
const responseSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      "question": { "type": "STRING" },
      "options": {
        type: "ARRAY",
        items: { type: "STRING" }
      },
      "correctAnswer": { "type": "STRING" }
    },
    required: ["question", "options", "correctAnswer"]
  }
};

// --- Routes ---

// Test route
router.get('/', (req, res) => {
  res.send('✅ Gemini AI Quiz Server is running successfully 🚀');
});

// AI generation route
router.post('/generate', async (req, res) => {
  try {
    const { topic, count = 10 } = req.body; // Get topic and optional count from body

    if (!topic) {
      return res.status(400).json({ error: '"topic" is required in the request body.' });
    }

    // Construct a clear prompt for the model
    const userPrompt = `
      Generate ${count} multiple-choice questions about the following topic: "${topic}".
      For each question, provide exactly 4 options.
      One of the options must be the correct answer.
      Ensure the 'correctAnswer' field exactly matches one of the strings in the 'options' array.
    `;

    // Set the generation config to force JSON output
    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
    };

    // Generate content
    const result = await model.generateContent({
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;

    // Check for safety blocks or missing content
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('❌ No candidates returned from API. Possible safety block.');
      console.log('Finish Reason:', response?.promptFeedback?.blockReason);
      console.log('Safety Ratings:', response?.promptFeedback?.safetyRatings);
      return res.status(500).json({ error: 'Failed to generate content. The prompt may have been blocked for safety reasons.' });
    }

    // Extract the text, which should be a JSON string
    const jsonText = response.text();

    // Parse the JSON string into a JavaScript object
    const jsonData = JSON.parse(jsonText);

    // Send the structured JSON data as the response
    res.json(jsonData);

  } catch (error) {
    console.error('❌ Error in /generate route:', error);
    res.status(500).json({ error: 'An internal server error occurred.', details: error.message });
  }
});

// Export router
module.exports = router;
