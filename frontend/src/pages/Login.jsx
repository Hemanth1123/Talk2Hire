// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { getToken, getUser, setToken, setUser } from "../utils/auth";
import "../styles/Login.css"; // make sure this path is correct

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        const token = getToken();
        const user = getUser();
        console.log(token);
        console.log(user);
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      alert(
        err.response?.data?.msg || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Login to your account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="register-link">
          Don't have an account?{" "}
          <Link to="/register" className="register-link-text">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
