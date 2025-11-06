// src/App.jsx
import { Routes, Route } from "react-router-dom";

// --- Components ---
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// --- Pages ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashboardPage";
// <-- Courses page
import BookInterview from "./pages/BookInterview";
import InterviewChat from "./pages/InterviewChat";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCoursesTopics from "./pages/ManageCoursesTopics";
import NotFoundPage from "./pages/NotFoundPage";
import About from "./pages/about";

export default function App() {
  return (
    <>
      {/* Navbar always visible */}
      <Navbar />

      <div style={{ paddingTop: "80px" }}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About/>} />

          {/* --- Protected User Routes --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* AI Interview chat */}
          <Route
            path="/interview/:id"
            element={
              <ProtectedRoute>
                <InterviewChat />
              </ProtectedRoute>
            }
          />

          {/* --- Admin Routes --- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <AdminRoute>
                <ManageCoursesTopics />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/book"
            element={
              <ProtectedRoute>
                <BookInterview />
              </ProtectedRoute>
            }
          />

          {/* --- 404 Fallback --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  );
}
