import { useEffect, useState } from "react";
import api from "../api/axios";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css"; // ✅ Updated premium CSS

export default function AdminDashboard() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = getToken();
      if (!token) {
        alert("⚠️ Please login as admin first.");
        navigate("/login");
        return;
      }

      const res = await api.get("/interviews/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch interviews.");
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = getToken();
      if (!token) {
        alert("⚠️ Please login as admin first.");
        navigate("/login");
        return;
      }

      await api.patch(`/interviews/${id}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInterviews();
    } catch (err) {
      console.error("Action error:", err);
      alert("Failed to perform action.");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Admin Interview Management</h2>
        <p className="subtitle">Monitor and manage all interview requests</p>
      </div>

      {interviews.length === 0 ? (
        <p className="no-data">No interview requests found.</p>
      ) : (
        <div className="interview-list">
          {interviews.map((iv) => (
            <div key={iv.id} className="interview-card">
              <div className="card-header">
                <h3>{iv.topicName}</h3>
                <span className={`status ${iv.status.toLowerCase()}`}>
                  {iv.status}
                </span>
              </div>

              <div className="card-details">
                <p><strong>User:</strong> {iv.user?.username || "Unknown"}</p>
                <p><strong>Date:</strong> {new Date(iv.scheduledDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {iv.scheduledTime}</p>
                <p><strong>Points:</strong> {iv.points ?? "Not submitted"}</p>
              </div>

              {iv.feedback && (
                <div className="feedback-box">
                  <h4>Feedback</h4>
                  <p><strong>Score:</strong> {iv.feedback.score}</p>
                  <p><strong>Strengths:</strong> {iv.feedback.strengths.join(", ") || "N/A"}</p>
                  <p><strong>Weaknesses:</strong> {iv.feedback.weaknesses.join(", ") || "N/A"}</p>
                  <p><strong>Remarks:</strong> {iv.feedback.remarks || "N/A"}</p>
                </div>
              )}

              {iv.status === "Pending" && (
                <div className="action-buttons">
                  <button
                    className="btn approve"
                    onClick={() => handleAction(iv.id, "accept")}
                  >
                    Approve
                  </button>
                  <button
                    className="btn decline"
                    onClick={() => handleAction(iv.id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

