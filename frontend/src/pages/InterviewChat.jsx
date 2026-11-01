import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { getToken } from "../utils/auth";
import "../styles/InterviewQuiz.css";

export default function InterviewQuiz() {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [stage, setStage] = useState("intro"); // intro | question | review
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [review, setReview] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const speechRef = useRef(null);

  // Speak text aloud
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
    speechRef.current = utterance;
  };

  // Fetch interview and questions
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const token = getToken();
        const res = await api.get(`/interviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const iv = res.data.data;
        if (!iv) return alert("Interview not found!");
        setInterview(iv);

        const quizRes = await api.post(
          "/quiz/generate",
          { topic: iv.topicName, count: 10 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuiz(quizRes.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load interview or quiz.");
      }
    };
    fetchInterview();
    return () => window.speechSynthesis.cancel();
  }, [id]);

  // Intro message
  useEffect(() => {
    if (stage === "intro" && interview) {
      const introText = `Welcome to your AI-powered interview for ${interview.topicName}. Let's begin shortly.`;
      speak(introText);
      const timer = setTimeout(() => setStage("question"), 4000);
      return () => clearTimeout(timer);
    }
  }, [stage, interview]);

  // Speak current question
  useEffect(() => {
    if (stage !== "question" || quiz.length === 0) return;
    const q = quiz[currentIndex];
    if (!q) return;
    const text = `Question ${currentIndex + 1}. ${q.question}. Options are: ${q.options.join(", ")}.`;
    speak(text);
    setTimeLeft(30);
  }, [stage, currentIndex, quiz]);

  // Timer countdown
  useEffect(() => {
    if (stage !== "question") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, currentIndex]);

  const handleSelect = (option) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setTimeout(() => handleNextQuestion(), 800);
  };

  const handleNextQuestion = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    window.speechSynthesis.cancel();
    let total = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) total += 1;
    });
    setScore(total);

    const percentage = (total / quiz.length) * 100;
    let feedback = "";
    if (percentage >= 80)
      feedback = "Excellent! You demonstrated strong understanding and clarity.";
    else if (percentage >= 60)
      feedback = "Good job! You’ve got solid fundamentals but can polish a bit more.";
    else if (percentage >= 40)
      feedback = "Fair attempt! Try revising the key concepts to improve further.";
    else feedback = "Needs improvement. Focus on consistency and core topics.";

    setReview(feedback);
    setStage("review");
    speak(`Your interview is complete. You scored ${total} out of ${quiz.length}. ${feedback}`);

    try {
      const token = getToken();
      const res = await api.patch(
        `/interviews/${id}/submit`,
        { points: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInterview((prev) => ({
        ...prev,
        points: res.data.data?.points ?? total,
      }));
    } catch (err) {
      console.error("Failed to submit points:", err);
    }
  };

  if (!interview) return <p>Loading interview...</p>;

  return (
    <div className="interview-container">
      <h2 className="interview-title">AI Interview – {interview.topicName}</h2>
      <p className="interview-points">
        Points: <strong>{interview.points}</strong>
      </p>

      {stage === "intro" && (
        <div className="intro-screen fade-in">
          <h2>Preparing your AI Interview...</h2>
          <p>Get ready! The session will start shortly.</p>
        </div>
      )}

      {stage === "question" && quiz[currentIndex] && (
        <div className="question-card fade-in">
          <div className="question-header">
            <h3>
              Question {currentIndex + 1} of {quiz.length}
            </h3>
            <span className={`timer ${timeLeft <= 5 ? "urgent" : ""}`}>
              {timeLeft}s
            </span>
          </div>
          <p className="question-text">{quiz[currentIndex].question}</p>
          <div className="options-container">
            {quiz[currentIndex].options.map((opt) => (
              <button
                key={opt}
                className={`option-btn ${
                  answers[currentIndex] === opt ? "selected" : ""
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "review" && (
        <div className="review-section fade-in">
          <h2>Interview Completed</h2>
          <p className="score-text">
            Final Score: <strong>{score}</strong> / {quiz.length}
          </p>
          <p className="feedback-text">{review}</p>
        </div>
      )}
    </div>
  );
}

