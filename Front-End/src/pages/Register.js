import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, resendOtp } from "../utils/api";
import { Spinner } from "react-bootstrap";
import OtpPage from "./OtpPage";
import "../Styles/Register.css";

const LoadingModal = () => (
  <div className="loading-overlay">
    <div className="loading-content">
      <Spinner animation="border" variant="success" className="mb-3 spinner-size" />
      <h5 className="mb-0 text-dark fw-bold">Creating Account...</h5>
    </div>
  </div>
);

function Register({ onLogin }) {
  const [view, setView] = useState('register');
  const [formData, setFormData] = useState({
    username: "", first_name: "", last_name: "", email: "", 
    phone_number: "", address: "", zipcode: "", 
    password: "", password_confirmation: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) { alert("Passwords do not match."); return; }
    
    setLoading(true);
    try {
      await registerUser(formData);
      setView('otp');
    } catch (err) {
      alert(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (view === 'otp') {
      return (
          <OtpPage 
             email={formData.email}
             context="register"
             onSuccess={(data) => {
                 if(onLogin) onLogin(data.token, data.user);
                 else navigate('/login');
             }}
             onResend={async () => await resendOtp({ email: formData.email })}
             onBack={() => setView('register')}
          />
      );
  }

  return (
    <div className="register-container">
      {loading && <LoadingModal />}
      
      <div className="register-card">
        {/* Header Section */}
        <div className="register-header">
             <button className="back-btn" onClick={() => navigate("/login")}>
                &larr; Back to Login
             </button>
             <div className="title-group">
                 <h2 className="store-name">JAKE STORE</h2>
                 <h3 className="subtitle">Create Account</h3>
             </div>
        </div>

        <form onSubmit={handleRegister}>
          <div className="row g-3">
            <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input type="text" name="first_name" className="form-control custom-input" value={formData.first_name} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input type="text" name="last_name" className="form-control custom-input" value={formData.last_name} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Username</label>
                <input type="text" name="username" className="form-control custom-input" value={formData.username} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-control custom-input" value={formData.email} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input type="text" name="phone_number" className="form-control custom-input" value={formData.phone_number} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Zipcode</label>
                <input type="text" name="zipcode" className="form-control custom-input" value={formData.zipcode} onChange={handleChange} required disabled={loading} />
            </div>
            <div className="col-12">
                <label className="form-label">Address</label>
                <input type="text" name="address" className="form-control custom-input" value={formData.address} onChange={handleChange} required disabled={loading} />
            </div>
            
            {/* Password Fields */}
            <div className="col-md-6">
                <label className="form-label">Password</label>
                <div className="input-group custom-input-group">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control custom-input border-end-0" value={formData.password} onChange={handleChange} required disabled={loading} />
                    <button className="btn btn-outline-secondary toggle-btn" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
            <div className="col-md-6">
                <label className="form-label">Confirm</label>
                <div className="input-group custom-input-group">
                    <input type={showConfirm ? "text" : "password"} name="password_confirmation" className="form-control custom-input border-end-0" value={formData.password_confirmation} onChange={handleChange} required disabled={loading} />
                    <button className="btn btn-outline-secondary toggle-btn" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? "Hide" : "Show"}
                    </button>
                </div>
            </div>
          </div>

          <button type="submit" className="btn submit-btn mt-4" disabled={loading}>
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;