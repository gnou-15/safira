import React, { useState, useEffect } from "react";
import InteractiveAuthPattern from "./InteractiveAuthPattern";
import BufferLoader from "./BufferLoader";
import "../css/LoginPage.css";


export default function LoginPage({
  handleLogin,
  handleSignup,
  isGenerating,
  onBackToHome,
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus tracking for floating label effect
  const [focusFields, setFocusFields] = useState({});

  // Success view states
  const [isSuccess, setIsSuccess] = useState(false);
  const [loginDetails, setLoginDetails] = useState({ name: "", email: "" });
  const [localLoading, setLocalLoading] = useState(false);

  // Name fields states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");


  // Check URL parameters for successful OAuth callback login tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    const oauthUsername = params.get("username");
    const oauthEmail = params.get("email");
    const oauthError = params.get("error");

    if (oauthToken && oauthUsername && oauthEmail) {
      setSuccessMsg("Welcome back! You are signed in with Google.");
      setLoginDetails({ name: oauthUsername, email: oauthEmail });
      setIsSuccess(true);
      
      // Persist google session
      localStorage.setItem("safira_token", oauthToken);
      localStorage.setItem("safira_user", JSON.stringify({
        username: oauthUsername,
        email: oauthEmail
      }));

      // Strip query parameters for a clean address bar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      setErrorMsg(`Google login failed: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleFocus = (fieldName) => {
    setFocusFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName, value) => {
    if (!value) {
      setFocusFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password || (isRegisterMode && (!firstname.trim() || !lastname.trim()))) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        const fullName = `${firstname.trim()} ${lastname.trim()}`;
        const success = await handleSignup(fullName, email.trim(), password);
        if (success) {
          setLoginDetails({ name: fullName, email: email.trim() });
          setSuccessMsg("Your account has been created successfully.");
          setIsSuccess(true);
        } else {
          setErrorMsg("Registration failed. Username or email may already be in use.");
        }
      } else {
        const success = await handleLogin(email.trim(), password, rememberMe);
        if (success) {
          setLoginDetails({ name: email.trim(), email: email.trim() });
          setSuccessMsg("Welcome back to your secure dashboard.");
          setIsSuccess(true);
        } else {
          setErrorMsg("Invalid email or password.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL || "";
    // Redirect browser to Google Authorization Route
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setUsername("");
    setFirstname("");
    setLastname("");
    setFocusFields({});
  };

  if (localLoading) {
    return <BufferLoader message="Entering secure safety workspace..." />;
  }

  return (
    <div className="login-page-container">
      <div className="login-split-layout">
        
        {/* Left Side: Form Column */}
        <div className="login-form-column">
          
          {/* Header branding & back button */}
          <div className="login-header-row">
            <div className="login-logo-header" onClick={onBackToHome}>
              {/* Safira Aviation Goggles Logo */}
              <svg viewBox="0 0 100 100" className="login-brand-logo" width="34" height="34">
                <defs>
                  <filter id="logo-glow-ed" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00f2fe" floodOpacity="0.3" />
                  </filter>
                </defs>
                <g filter="url(#logo-glow-ed)">
                  <path d="M 26,44 C 26,62 30,76 50,76 C 70,76 74,62 74,44 Z" fill="#fde0c5" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 46,65 Q 50,69 54,65" fill="none" stroke="#3b1c14" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="33" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />
                  <circle cx="67" cy="62" r="3.5" fill="#fca5a5" opacity="0.6" />
                  <path d="M 18,45 C 18,20 32,10 50,10 C 68,10 82,20 82,45 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 50,10 L 50,45" stroke="#3b1c14" strokeWidth="2.5" />
                  <path d="M 22,42 C 16,52 14,64 15,78 C 16,84 20,86 23,83 C 26,80 26,68 26,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 25,44 C 22,50 20,60 21,76 C 21.5,79 23,80 24.5,78 C 26,75 26.5,66 26.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M 78,42 C 84,52 86,64 85,78 C 84,84 80,86 77,83 C 74,80 74,68 74,42 Z" fill="#9d532a" stroke="#3b1c14" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 75,44 C 78,50 80,60 79,76 C 78.5,79 77,80 75.5,78 C 74,75 73.5,66 73.5,44 Z" fill="#f6e5b5" stroke="#3b1c14" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M 18,52 C 18,52 30,50 50,50 C 70,50 82,52 82,52" stroke="#451c14" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="39" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                  <circle cx="39" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                  <circle cx="39" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                  <path d="M 36,50 L 38,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="61" cy="52" r="10" fill="#e5832a" stroke="#3b1c14" strokeWidth="2" />
                  <circle cx="61" cy="52" r="7.5" fill="#f9ab55" stroke="#3b1c14" strokeWidth="1.5" />
                  <circle cx="61" cy="52" r="6" fill="#7cd4d5" stroke="#3b1c14" strokeWidth="1.5" />
                  <path d="M 58,50 L 60,48" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </svg>
              <span className="login-brand-text">Safira</span>
            </div>
            {!isSuccess && (
              <button type="button" className="login-back-link-btn" onClick={onBackToHome}>
                &larr; Back to Home
              </button>
            )}
          </div>


          <div className="login-form-wrapper">
            {isSuccess ? (
              <div className="login-form-content login-success-view">
                <div className="success-icon-container">
                  <div className="success-checkmark-circle">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>


                <div className="login-heading-block" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
                  <h2 className="login-title">Success!</h2>
                  <p className="login-subtitle">
                    {successMsg}
                  </p>
                </div>

                <div className="user-profile-badge">
                  <div className="profile-avatar">
                    {loginDetails.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{loginDetails.name}</div>
                    <div className="profile-email">{loginDetails.email}</div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="login-btn-primary" 
                  style={{ marginTop: "2rem" }}
                  onClick={() => {
                    setLocalLoading(true);
                    localStorage.setItem("safira_current_page", "landing");
                    setTimeout(() => {
                      const cachedToken = localStorage.getItem("safira_token");
                      if (cachedToken) {
                        window.location.reload();
                      } else {
                        onBackToHome();
                      }
                    }, 800);
                  }}
                >
                  Go to Dashboard &rarr;
                </button>
              </div>
            ) : (
              <div className="login-form-content">
                <div className="login-heading-block">
                  <h2 className="login-title">
                    {isRegisterMode ? "Create your account" : "Welcome back !"}
                  </h2>
                  <p className="login-subtitle">
                    {isRegisterMode
                      ? "Create a Safira workspace account to manage security reports."
                      : "Enter details to access your reports and manuals."}
                  </p>
                </div>

                {/* Alert notifications */}
                {errorMsg && <div className="login-alert-banner login-alert-error">{errorMsg}</div>}
                {successMsg && <div className="login-alert-banner login-alert-success">{successMsg}</div>}

                <form onSubmit={handleSubmit} className="login-form-el">
                  {/* First Name & Last Name Fields (Register only) */}
                  {isRegisterMode && (
                    <div className="login-names-row">
                      <div className={`login-input-group ${focusFields.firstname || firstname ? "focused" : ""}`} style={{ flex: 1 }}>
                        <input
                          type="text"
                          id="firstname"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          onFocus={() => handleFocus("firstname")}
                          onBlur={() => handleBlur("firstname", firstname)}
                          required
                          disabled={loading}
                          className="login-input-field"
                        />
                        <label htmlFor="firstname" className="login-label-el">
                          First name
                        </label>
                      </div>
                      <div className={`login-input-group ${focusFields.lastname || lastname ? "focused" : ""}`} style={{ flex: 1 }}>
                        <input
                          type="text"
                          id="lastname"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          onFocus={() => handleFocus("lastname")}
                          onBlur={() => handleBlur("lastname", lastname)}
                          required
                          disabled={loading}
                          className="login-input-field"
                        />
                        <label htmlFor="lastname" className="login-label-el">
                          Last name
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className={`login-input-group ${focusFields.email || email ? "focused" : ""}`}>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => handleFocus("email")}
                      onBlur={() => handleBlur("email", email)}
                      required
                      disabled={loading}
                      className="login-input-field"
                    />
                    <label htmlFor="email" className="login-label-el">
                      Email address
                    </label>
                  </div>

                  {/* Password Field */}
                  <div className={`login-input-group ${focusFields.password || password ? "focused" : ""}`}>
                    <label htmlFor="password" className="login-label-el">
                      Password
                    </label>
                    <div className="login-password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => handleFocus("password")}
                        onBlur={() => handleBlur("password", password)}
                        required
                        disabled={loading}
                        className="login-input-field login-input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="login-password-toggle-btn"
                        tabIndex="-1"
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Remember Me & Forgot Password */}
                  {!isRegisterMode && (
                    <div className="login-actions-row">
                      <label className="login-checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                          className="login-checkbox-input"
                        />
                        <span className="login-checkbox-text">Remember me</span>
                      </label>
                      <a
                        href="#"
                        className="login-forgot-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setErrorMsg("Password recovery is managed by your system administrator.");
                        }}
                      >
                        Forgot your password ?
                      </a>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button type="submit" className="login-btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="login-spinner"></span>
                    ) : (
                      isRegisterMode ? "Register Account" : "Log In"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="login-divider">
                  <span className="login-divider-text">Or, Login with</span>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  className="login-btn-google"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="google-svg-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>

                {/* View Switch Footer */}
                <p className="login-footer-text">
                  {isRegisterMode ? "Already have an account ?" : "Don't have an account ?"}
                  {" "}
                  <button type="button" className="login-link-btn" onClick={toggleMode}>
                    {isRegisterMode ? "Login here" : "Register here"}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Secure connection footer */}
          <div className="login-column-footer">
            <span>Secure TLS 1.3 Connection</span>
            <span className="footer-dot">•</span>
            <span>© {new Date().getFullYear()} Safira</span>
          </div>

        </div>

        {/* Right Side: Interactive SVGs (Blue layout pattern) */}
        <div className="login-pattern-column">
          <InteractiveAuthPattern />
        </div>

      </div>
    </div>
  );
}
