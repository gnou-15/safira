import React, { useState, useEffect } from "react";
import InteractiveAuthPattern from "./InteractiveAuthPattern";
import "../css/LoginPage.css";

export default function LoginPage({
  handleKeyLogin,
  handleKeyGenerate,
  onBackToHome,
  setUser,
  handleNavigate
}) {
  const [keyInput, setKeyInput] = useState(() => {
    return localStorage.getItem('safira_remembered_key') || "";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("Copy Key");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onBackToHome();
    }, 300);
  };

  // Automatically navigate to landing after success if it wasn't a newly generated key
  useEffect(() => {
    if (isSuccess && !generatedKey) {
      const timer = setTimeout(() => {
        handleClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, generatedKey]);

  // Handle keystrokes to auto-format to AAA-000 (e.g. inject hyphen, force uppercase)
  const handleKeyInputChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // If length is greater than 3, insert a hyphen
    if (val.length > 3) {
      val = val.slice(0, 3) + "-" + val.slice(3, 6);
    } else {
      val = val.slice(0, 3);
    }
    
    setKeyInput(val);
    setErrorMsg("");
  };

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const normalizedKey = keyInput.trim();
    if (!normalizedKey) {
      setErrorMsg("Please enter your secure key.");
      return;
    }

    if (!/^[A-Z]{3}-\d{3}$/.test(normalizedKey)) {
      setErrorMsg("Invalid key format. Must be AAA-000 (e.g. ABC-123).");
      return;
    }

    setLoading(true);
    setIsUnlocking(true);

    try {
      // Small delay for turning animation effect
      await new Promise(resolve => setTimeout(resolve, 600));
      const success = await handleKeyLogin(normalizedKey);
      if (success) {
        setSuccessMsg("Access Granted. Unlocking safety dashboard...");
        setIsSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.message || "Key not registered or invalid.");
      setIsUnlocking(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    setIsUnlocking(true);

    try {
      // Small delay for key turning animation
      await new Promise(resolve => setTimeout(resolve, 600));
      const key = await handleKeyGenerate();
      if (key) {
        setGeneratedKey(key);
        setSuccessMsg("New secure key generated and copied!");
        setIsSuccess(true);
        
        // Trigger clipboard copy
        try {
          await navigator.clipboard.writeText(key);
          setCopyFeedback("Copied!");
        } catch (e) {
          console.warn("Auto copy to clipboard failed");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to generate key. Please try again.");
      setIsUnlocking(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyGeneratedKey = async () => {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback("Copy Key"), 2000);
    } catch (e) {
      setErrorMsg("Failed to copy to clipboard. Please copy manually.");
    }
  };

  const handleEnterDashboard = () => {
    handleClose();
  };

  return (
    <div className={`login-page-container ${isClosing ? "closing" : ""}`} onClick={handleClose}>
      <div className={`login-split-layout ${isClosing ? "closing" : ""}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Left Side: Keyhole Verification Column */}
        <div className="login-form-column">
          
          {/* Header branding & back button */}
          <div className="login-header-row">
            <div className="login-logo-header" onClick={handleClose}>
              <svg viewBox="0 0 100 100" className="login-brand-logo" width="34" height="34">
                <defs>
                  <filter id="goggles-glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#3b82f6" floodOpacity="0.25" />
                  </filter>
                </defs>
                <g filter="url(#goggles-glow)">
                  <path d="M 28,45 C 28,60 32,72 50,72 C 68,72 72,60 72,45 Z" fill="#fde0c5" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 47,62 Q 50,65 53,62" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                  <path d="M 20,46 C 20,24 32,15 50,15 C 68,15 80,24 80,46 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 50,15 L 50,46" stroke="#1e293b" strokeWidth="2.5" />
                  <path d="M 24,43 C 18,52 16,62 17,74 C 18,79 21,81 24,78 C 27,75 27,65 27,43 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 76,43 C 82,52 84,62 83,74 C 82,79 79,81 76,78 C 73,75 73,65 73,43 Z" fill="#475569" stroke="#1e293b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M 20,52 C 20,52 30,50 50,50 C 70,50 80,52 80,52" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="39" cy="52" r="9" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="39" cy="52" r="5" fill="#38bdf8" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M 36,50 L 38,48" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                  <circle cx="61" cy="52" r="9" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                  <circle cx="61" cy="52" r="5" fill="#38bdf8" stroke="#1e293b" strokeWidth="1.5" />
                  <path d="M 58,50 L 60,48" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                </g>
              </svg>
              <span className="login-brand-text">Safira</span>
            </div>
            {!isSuccess && (
              <button type="button" className="login-back-link-btn" onClick={handleClose}>
                &larr; Back to Home
              </button>
            )}
          </div>

          <div className="login-form-wrapper">
            {isSuccess && generatedKey ? (
              /* Success view for Generated Key (Allows copying before dashboard enter) */
              <div className="login-form-content login-success-view">
                <div className="success-icon-container">
                  <div className="success-checkmark-circle">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div className="login-heading-block" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <h2 className="login-title">Your Secure Key</h2>
                  <p className="login-subtitle">
                    Safira has created a unique workspace key for you. Copy and keep it safe!
                  </p>
                </div>

                <div className="generated-key-container">
                  <div className="generated-key-box">{generatedKey}</div>
                  <button 
                    type="button" 
                    className={`key-copy-btn ${copyFeedback === 'Copied!' ? 'copied' : ''}`}
                    onClick={handleCopyGeneratedKey}
                  >
                    {copyFeedback === 'Copied!' ? '✓ Copied' : '📋 Copy Key'}
                  </button>
                </div>

                <div className="key-warning-notice">
                  ⚠️ <strong>Important:</strong> We do not store recovery emails. If you lose this key, you will lose access to your reports.
                </div>

                <button type="button" className="login-btn-primary" onClick={handleEnterDashboard} style={{ marginTop: '1.5rem' }}>
                  Enter Dashboard
                </button>
              </div>
            ) : isSuccess ? (
              /* Simple Success login view */
              <div className="login-form-content login-success-view">
                <div className="success-icon-container">
                  <div className="success-checkmark-circle">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>

                <div className="login-heading-block" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
                  <h2 className="login-title">Access Granted</h2>
                  <p className="login-subtitle">{successMsg}</p>
                </div>

                <div className="login-loading-inline" style={{ marginTop: "2.5rem" }}>
                  <div className="login-inline-spinner"></div>
                  <span className="login-inline-loading-text">Opening workspace...</span>
                </div>
              </div>
            ) : (
              /* Default Keyhole Entry form */
              <div className="login-form-content">
                
                {/* Visual Keyhole */}
                <div className="keyhole-visual-wrapper" onClick={handleGenerateAndLogin} title="Click keyhole to generate a new key">
                  <div className={`keyhole-ring-glow ${isUnlocking ? 'spinning' : ''}`}>
                    {/* Energy Absorption Rings */}
                    <div className="energy-absorber absorber-1"></div>
                    <div className="energy-absorber absorber-2"></div>
                    <div className="energy-absorber absorber-3"></div>

                    <svg viewBox="0 0 100 100" className={`keyhole-svg ${isUnlocking ? 'unlocking' : ''}`} width="80" height="80">
                      <defs>
                        <linearGradient id="metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#475569" />
                          <stop offset="50%" stopColor="#1e293b" />
                          <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <linearGradient id="gold-ring" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fde047" />
                          <stop offset="50%" stopColor="#ca8a04" />
                          <stop offset="100%" stopColor="#854d0e" />
                        </linearGradient>
                        <radialGradient id="neon-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Outer Glowing Radial */}
                      <circle cx="50" cy="50" r="48" fill="url(#neon-glow)" className="keyhole-bg-glow" />

                      {/* Outer Brass/Gold Bezel */}
                      <circle cx="50" cy="50" r="42" fill="url(#gold-ring)" stroke="#0f172a" strokeWidth="2.5" />
                      <circle cx="50" cy="50" r="38" fill="#1e293b" stroke="#ca8a04" strokeWidth="1" />

                      {/* Mechanical Tick Marks */}
                      <g stroke="#ca8a04" strokeWidth="1.5" opacity="0.6">
                        <line x1="50" y1="12" x2="50" y2="15" />
                        <line x1="50" y1="85" x2="50" y2="88" />
                        <line x1="12" y1="50" x2="15" y2="50" />
                        <line x1="85" y1="50" x2="88" y2="50" />
                        <line x1="23" y1="23" x2="25" y2="25" />
                        <line x1="75" y1="75" x2="77" y2="77" />
                        <line x1="23" y1="77" x2="25" y2="75" />
                        <line x1="75" y1="25" x2="77" y2="27" />
                      </g>

                      {/* Inner Steel Core Plate */}
                      <circle cx="50" cy="50" r="33" fill="url(#metal-grad)" stroke="#0f172a" strokeWidth="2" />
                      
                      {/* Concentric Cyber Rings */}
                      <circle cx="50" cy="50" r="24" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" className="cyber-ring-spin" />

                      {/* Glowing center keyhole recess */}
                      <circle cx="50" cy="42" r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                      <path d="M 45,46 L 55,46 L 58,64 L 42,64 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" />
                      
                      {/* Inner deep shadow */}
                      <circle cx="50" cy="42" r="5" fill="#020617" />
                      <path d="M 47,48 L 53,48 L 55,62 L 45,62 Z" fill="#020617" />
                    </svg>
                  </div>
                  <span className="keyhole-hint-text">Click Keyhole to generate key</span>
                </div>

                <div className="login-heading-block">
                  <h2 className="login-title">Unlock Safira Workspace</h2>
                  <p className="login-subtitle">
                    Enter your mnemonic key to safely manage safety reports.
                  </p>
                </div>

                {errorMsg && <div className="login-alert-banner login-alert-error">{errorMsg}</div>}

                <form onSubmit={handleUnlock} className="login-form-el">
                  <div className="login-input-group focused">
                    <input
                      type="text"
                      id="mnemonic-key"
                      placeholder="AAA-000"
                      value={keyInput}
                      onChange={handleKeyInputChange}
                      maxLength="7"
                      required
                      disabled={loading}
                      className="login-input-field key-input-style"
                      autoComplete="off"
                      autoFocus
                    />
                    <label htmlFor="mnemonic-key" className="login-label-el">
                      Workspace Key
                    </label>
                  </div>

                  <button type="submit" className="login-btn-primary" disabled={loading}>
                    {loading ? <span className="login-spinner"></span> : "🔑 Unlock Workspace"}
                  </button>
                </form>

                <div className="login-divider">
                  <span className="login-divider-text">No workspace key?</span>
                </div>

                <button
                  type="button"
                  className="login-btn-generate-key"
                  onClick={handleGenerateAndLogin}
                  disabled={loading}
                >
                  🔑 Generate New Key Instantly
                </button>
              </div>
            )}
          </div>

          {/* Secure connection footer */}
          <div className="login-column-footer">
            <span>Client-Side Local Storage Auth</span>
            <span className="footer-dot">•</span>
            <span>© {new Date().getFullYear()} Safira</span>
          </div>

        </div>

        {/* Right Side: Interactive Pattern */}
        <div className="login-pattern-column">
          <InteractiveAuthPattern />
        </div>

      </div>
    </div>
  );
}
