import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/BookInterview.css";

export default function BookInterview() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        alert("Unable to load courses. Please try again.");
      }
    };
    fetchCourses();
  }, []);

  // ✅ Allow only one course
  const selectCourse = (courseId) => {
    setSelectedCourse((prev) => (prev === courseId ? null : courseId));
  };

  // ✅ Icon generator
  const getCourseIcon = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes("python")) return "fa-brands fa-python";
    if (name.includes("javascript") || name.includes("js"))
      return "fa-brands fa-js";
    if (name.includes("react")) return "fa-brands fa-react";
    if (name.includes("node")) return "fa-brands fa-node-js";
    if (name.includes("java")) return "fa-brands fa-java";
    if (name.includes("c++") || name.includes("c ")) return "fa-solid fa-code";
    if (name.includes("data") || name.includes("analysis"))
      return "fa-solid fa-database";
    if (name.includes("machine") || name.includes("ml"))
      return "fa-solid fa-robot";
    if (name.includes("ai") || name.includes("artificial"))
      return "fa-solid fa-brain";
    if (name.includes("design") || name.includes("ui") || name.includes("ux"))
      return "fa-solid fa-palette";
    if (name.includes("network") || name.includes("cyber"))
      return "fa-solid fa-network-wired";
    if (name.includes("cloud")) return "fa-solid fa-cloud";
    if (name.includes("blockchain")) return "fa-brands fa-bitcoin";
    if (name.includes("sql") || name.includes("database"))
      return "fa-solid fa-server";
    if (name.includes("mobile") || name.includes("app"))
      return "fa-solid fa-mobile-screen";
    if (name.includes("security")) return "fa-solid fa-shield-halved";
    if (name.includes("testing") || name.includes("qa"))
      return "fa-solid fa-vial";
    return "fa-solid fa-book";
  };

  // ✅ Booking
  const handleBooking = async () => {
    if (!selectedCourse) return alert("Please select one course!");
    if (!date || !time) return alert("Please choose date and time!");

    try {
      const course = courses.find((c) => c._id === selectedCourse);
      if (!course) return alert("Course not found!");

      await api.post("/interviews", {
        topicName: course.name,
        date,
        time,
      });

      alert("✅ Interview booked successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error booking interview:", err);
      alert("Failed to book interview. Try again.");
    }
  };

  // ✅ Start AI interview exactly at booked time
  useEffect(() => {
    if (!date || !time || !selectedCourse) return;

    const checkTime = setInterval(() => {
      const now = new Date();
      const booked = new Date(`${date}T${time}:00`);

      if (
        now.getFullYear() === booked.getFullYear() &&
        now.getMonth() === booked.getMonth() &&
        now.getDate() === booked.getDate() &&
        now.getHours() === booked.getHours() &&
        now.getMinutes() === booked.getMinutes()
      ) {
        clearInterval(checkTime);
        alert("🎤 Interview starting now!");
        navigate("/interview-start");
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(checkTime);
  }, [date, time, selectedCourse, navigate]);

  return (
    <div className="book-interview-wrapper">
      <div className="book-interview-container">
        <h2 className="title">Book Your AI Interview</h2>
        <p className="subtitle">Select one course and choose your interview slot</p>

        {/* Courses */}
        <div className="course-list">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`course-card ${
                selectedCourse === course._id ? "selected" : ""
              }`}
              onClick={() => selectCourse(course._id)}
            >
              <div className="course-icon">
                <i className={getCourseIcon(course.name)}></i>
              </div>
              <h3>{course.name}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>

        {/* Slot Picker */}
        <div className="slot-picker">
          <h3>Choose Slot</h3>
          <div className="slot-inputs">
            <div>
              <label>Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label>Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="book-btn" onClick={handleBooking}>
          <i className="fa-solid fa-calendar-check"></i> Book Interview
        </button>
      </div>
    </div>
  );
}
