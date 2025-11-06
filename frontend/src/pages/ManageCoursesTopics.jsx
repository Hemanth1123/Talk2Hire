import { useEffect, useState } from "react";
import api from "../api/axios";
import { getToken } from "../utils/auth";
import "../styles/ManageCourses.css";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = getToken();
      const res = await api.get("/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.data || res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      alert("Failed to fetch courses. Make sure you are logged in.");
    }
  };

  const addCourse = async () => {
    if (!newCourse.trim()) return alert("Please enter a course name!");
    try {
      const token = getToken();
      await api.post(
        "/courses",
        { name: newCourse },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCourse("");
      fetchCourses();
    } catch (err) {
      console.error("Failed to add course:", err);
      alert("Failed to add course. It might already exist.");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = getToken();
      await api.delete(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error("Failed to delete course:", err);
      alert("Failed to delete course.");
    }
  };

  return (
    <div className="manage-container">
      <h2 className="manage-title">
        <i className="fa-solid fa-book-open-reader"></i> Manage Courses
      </h2>

      {/* Add Course Section */}
      <div className="add-course-box">
        <input
          type="text"
          placeholder="Enter new course name..."
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
        />
        <button className="add-btn" onClick={addCourse}>
          <i className="fa-solid fa-plus"></i> Add Course
        </button>
      </div>

      {/* Course List */}
      <ul className="course-list">
        {courses.length > 0 ? (
          courses.map((c) => (
            <li key={c._id} className="course-item">
              <span className="course-name">
                <i className="fa-solid fa-graduation-cap"></i> {c.name}
              </span>
              <button className="delete-btn" onClick={() => deleteCourse(c._id)}>
                <i className="fa-solid fa-trash"></i> Delete
              </button>
            </li>
          ))
        ) : (
          <p className="no-courses">No courses added yet.</p>
        )}
      </ul>
    </div>
  );
}

