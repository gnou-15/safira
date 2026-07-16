import { useState, useEffect } from 'react';
import '../css/ChatbotSidebar.css';

export default function ChatbotSidebar({
  chatOpen,
  setChatOpen,
  chatHistory,
  chatInput,
  setChatInput,
  isLoadingChat,
  handleSendMessage
}) {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const btn = document.querySelector('.chatbot-toggle-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        
        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const maxOffset = 6; // Max displacement inside the goggle lens
        if (distance === 0) {
          setEyeOffset({ x: 0, y: 0 });
        } else {
          const ratio = Math.min(maxOffset / distance, 1);
          setEyeOffset({
            x: dx * ratio,
            y: dy * ratio
          });
        }
      } else {
        const dx = (e.clientX / window.innerWidth) - 0.5;
        const dy = (e.clientY / window.innerHeight) - 0.5;
        setEyeOffset({ x: dx * 6, y: dy * 6 });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Shared linear gradients and clip paths definitions for Chatbot Logos */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <defs>
          <filter id="chatbot-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#00f2fe" floodOpacity="0.3" />
          </filter>
          {/* Clip path to restrict anime sheen sweep to the inside of the lens */}
          <clipPath id="lens-clip">
            <circle cx="50" cy="50" r="28" />
          </clipPath>
        </defs>
      </svg>

      {/* Floating chatbot overlay at bottom right */}
      <aside className={`chatbot-sidebar ${chatOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            {/* Animated Radar Airport Theme Background */}
            <div className="header-radar-bg">
              <svg viewBox="0 0 360 50" preserveAspectRatio="none" className="radar-svg">
                {/* Concentric Radar Rings */}
                <circle cx="180" cy="25" r="20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                <circle cx="180" cy="25" r="40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <circle cx="180" cy="25" r="70" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                
                {/* Radar Grid Lines */}
                <line x1="0" y1="25" x2="360" y2="25" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                <line x1="180" y1="0" x2="180" y2="50" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />

                {/* Sweeping Radar Line */}
                <line className="radar-sweep" x1="180" y1="25" x2="360" y2="25" stroke="rgba(58, 154, 217, 0.15)" strokeWidth="2" />
                
                {/* Pulsing Airport/Target Blip */}
                <circle className="radar-blip" cx="240" cy="15" r="3" fill="#22c55e" />
                <circle className="radar-blip-pulse" cx="240" cy="15" r="8" fill="none" stroke="#22c55e" strokeWidth="1" />

                {/* Airplane flying across screen */}
                <g className="radar-airplane">
                  <path d="M-10,0 L2,0 L5,-3 L7,-3 L5,0 L10,0 L12,2 L10,2 L8,5 L6,5 L8,2 L2,2 Z" fill="rgba(255,255,255,0.06)" />
                </g>
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <svg viewBox="0 0 100 100" width="22" height="22">
                <g filter="url(#chatbot-glow)">
                  {/* Outer Rim */}
                  <circle cx="50" cy="50" r="42" fill="#e5832a" stroke="#3b1c14" strokeWidth="5" />
                  {/* Inner Frame */}
                  <circle cx="50" cy="50" r="34" fill="#f9ab55" stroke="#3b1c14" strokeWidth="3" />
                  {/* Eyeball (White Sclera) */}
                  <circle cx="50" cy="50" r="28" fill="#ffffff" stroke="#3b1c14" strokeWidth="3" />
                  
                  {/* Eye translation group (follows mouse) */}
                  <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
                    {/* Eye blink group (CSS animated scaleY) */}
                    <g className="eye-blink-group">
                      {/* Blue Iris */}
                      <circle cx="50" cy="50" r="17" fill="#00b5ff" stroke="#3b1c14" strokeWidth="2" />
                      {/* Iris details */}
                      <path d="M 40,40 L 43,43" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 60,60 L 57,57" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 40,60 L 43,57" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 60,40 L 57,43" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                      
                      {/* Pupil */}
                      <circle cx="50" cy="50" r="9" fill="#0d1e29" />
                      {/* Pupil Glare Highlights */}
                      <circle cx="47.5" cy="47.5" r="2.2" fill="#ffffff" />
                      <circle cx="53" cy="53" r="1" fill="#ffffff" />
                    </g>
                  </g>
                  
                  {/* Anime Glasses Shine (sweeps diagonal glint inside the lens bounds) */}
                  <g clipPath="url(#lens-clip)">
                    <rect className="anime-shine-swipe" x="-70" y="-30" width="24" height="160" fill="#ffffff" opacity="0.8" />
                  </g>
                  
                  {/* Static Glare outline */}
                  <path d="M 36,36 L 44,28" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
                </g>
              </svg>
              <h4 className="chatbot-title">SAFIRA AI Safety Bot</h4>
            </div>
            <button 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 2, fontSize: '16px', opacity: 0.8 }} 
              onClick={() => setChatOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-history">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoadingChat && (
              <div className="chat-msg chat-msg-assistant">
                <div className="loader-spinner"></div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Ask to change rows, verify, or Q&A..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isLoadingChat}
              />
              <button type="submit" className="chat-send-btn" disabled={isLoadingChat}>
                ✈️
              </button>
            </div>
          </form>
        </aside>

      {/* Floating robot icon to toggle chat (always visible) */}
      <div 
        className={`chatbot-toggle-btn ${chatOpen ? 'chat-active' : ''}`} 
        onClick={() => setChatOpen(!chatOpen)} 
        title={chatOpen ? "Close AI Chat" : "Open AI Chat"}
      >
        <svg viewBox="0 0 100 100" width="60" height="60">
          <g filter="url(#chatbot-glow)">
            {/* Outer Rim */}
            <circle cx="50" cy="50" r="42" fill="#e5832a" stroke="#3b1c14" strokeWidth="5" />
            {/* Inner Frame */}
            <circle cx="50" cy="50" r="34" fill="#f9ab55" stroke="#3b1c14" strokeWidth="3" />
            {/* Eyeball (White Sclera) */}
            <circle cx="50" cy="50" r="28" fill="#ffffff" stroke="#3b1c14" strokeWidth="3" />
            
            {/* Eye translation group (follows mouse) */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              {/* Eye blink group (CSS animated scaleY) */}
              <g className="eye-blink-group">
                {/* Blue Iris */}
                <circle cx="50" cy="50" r="17" fill="#00b5ff" stroke="#3b1c14" strokeWidth="2" />
                {/* Iris details */}
                <path d="M 40,40 L 43,43" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 60,60 L 57,57" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 40,60 L 43,57" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 60,40 L 57,43" stroke="#0091d9" strokeWidth="1.5" strokeLinecap="round" />
                
                {/* Pupil */}
                <circle cx="50" cy="50" r="9" fill="#0d1e29" />
                {/* Pupil Glare Highlights */}
                <circle cx="47.5" cy="47.5" r="2.2" fill="#ffffff" />
                <circle cx="53" cy="53" r="1" fill="#ffffff" />
              </g>
            </g>
            
            {/* Anime Glasses Shine (sweeps diagonal glint inside the lens bounds) */}
            <g clipPath="url(#lens-clip)">
              <rect className="anime-shine-swipe" x="-70" y="-30" width="24" height="160" fill="#ffffff" opacity="0.8" />
            </g>
            
            {/* Static Glare outline */}
            <path d="M 36,36 L 44,28" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
          </g>
        </svg>
      </div>
    </>
  );
}
