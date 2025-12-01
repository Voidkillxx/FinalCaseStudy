import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, resendOtp } from "../utils/api";
import OtpPage from "./OtpPage";
import "../Styles/Register.css";

const LoadingModal = () => (
  <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 2000 }}>
    <div className="bg-white p-4 rounded shadow text-center">
      <div className="spinner-border text-success mb-3" style={{ width: "3rem", height: "3rem" }}></div>
      <h5 className="mb-0 text-dark fw-bold">Creating Account...</h5>
    </div>
  </div>
);

function Register({ onLogin }) {
  const navigate = useNavigate();

  const [view, setView] = useState("register");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    zipcode: "",
    address: "",
    password: "",
    password_confirmation: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState("");

  const openDialog = (msg) => {
    setDialogMsg(msg);
    setDialogOpen(true);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      openDialog("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      setView("otp");
    } catch (err) {
      openDialog(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (view === "otp") {
    return (
      <OtpPage
        email={formData.email}
        context="register"
        onSuccess={(data) => {
          if (onLogin) onLogin(data.token, data.user);
          else navigate("/login");
        }}
        onResend={async () => await resendOtp({ email: formData.email })}
        onBack={() => setView("register")}
      />
    );
  }

  return (
    <div className="register-container">
      
      {dialogOpen && (
        <div className="dialog-bg">
          <div className="dialog-box">
            <p>{dialogMsg}</p>
            <button onClick={() => setDialogOpen(false)}>OK</button>
          </div>
        </div>
      )}

      {loading && <LoadingModal />}

      <div className="register-card">
        <button className="back-btn" onClick={() => navigate("/login")}>
          ← Back to Login
        </button>

        <h2 className="store-name">JAKE STORE</h2>
        <p className="subtitle">Create Account</p>

        <form onSubmit={handleRegister}>
          <div className="row g-3">

            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Zipcode</label>
              <input
                type="text"
                name="zipcode"
                value={formData.zipcode}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Password</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Confirm Password</label>
              <div className="password-container">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Register;