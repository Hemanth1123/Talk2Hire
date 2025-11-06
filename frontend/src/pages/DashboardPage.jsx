import { useEffect, useState } from "react";
import api from "../api/axios";
import { getToken } from "../utils/auth";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import "../styles/DashboardPage.css"; // ✅ New premium CSS

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert("⚠️ Please login first.");
        navigate("/login");
        return;
      }
      const res = await api.get("/interviews/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(res.data.data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;

    try {
      const token = getToken();
      await api.delete(`/interviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInterviews((prev) => prev.filter((iv) => iv.id !== id));
      alert("Interview deleted successfully ✅");
    } catch (err) {
      console.error("Error deleting interview:", err);
      alert("Failed to delete interview. Please try again.");
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>My Interviews</h2>
        <Link to="/dashboard/book" className="book-btn">
          + Book New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <p className="no-data">No interviews booked yet.</p>
      ) : (
        <div className="interview-list">
          {interviews.map((iv) => (
            <div key={iv.id} className="interview-card">
              <div className="interview-info">
                <h3>Topic: {iv.topicName || "Unknown Topic"}</h3>
                <p>Date: {new Date(iv.scheduledDate).toLocaleDateString()}</p>
                <p>Time: {iv.scheduledTime}</p>
                <p>
                  Status:{" "}
                  <span className={`status ${iv.status.toLowerCase()}`}>
                    {iv.status}
                  </span>
                </p>
                <p>
                  Points:{" "}
                  <strong>{iv.points ?? "Test not started"}</strong>
                </p>

                {iv.status === "Accepted" && (
                  <Link to={`/interview/${iv.id}`} className="start-btn">
                    Start Interview
                  </Link>
                )}
              </div>

              <button
                className="delete-btn"
                onClick={() => handleDelete(iv.id)}
                title="Delete Interview"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
