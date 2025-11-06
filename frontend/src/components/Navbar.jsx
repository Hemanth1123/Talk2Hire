import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, removeToken, removeUser } from "../utils/auth";
import "../styles/Navbar.css";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            Hack2Hire
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`nav-link ${isActive("/about") ? "active" : ""}`}
            >
              About
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${
                    isActive("/dashboard") ? "active" : ""
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <>
                    <Link
                      to="/admin"
                      className={`nav-link ${
                        isActive("/admin") ? "active" : ""
                      }`}
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/manage"
                      className={`nav-link ${
                        isActive("/admin/manage") ? "active" : ""
                      }`}
                    >
                      Manage Data
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {user ? (
            <button onClick={handleLogout} className="btn logout-btn">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn login-btn">
                Login
              </Link>
              <Link to="/register" className="btn register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

