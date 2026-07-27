import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function useChatbot(authedFetch, executeTableUpdate) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am SAFIRA, your airport safety AI assistant. Describe an incident or select a report to get started. I can help explain regulations or make inline edits to your report.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Send message to chatbot (RAG Chat API)
  const handleSendMessage = async (e, activeReport = null, rows = [], activeInvestigation = null, onInvestigationUpdate = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() || isLoadingChat) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoadingChat(true);

    try {
      const chatPayload = {
        message: userMsg,
        chat_history: chatHistory.slice(-6),
        current_table: activeReport ? rows : [],
        doc_type: activeInvestigation ? 'investigation' : 'hirac',
        current_investigation: activeInvestigation
      };
      const res = await authedFetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatPayload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch AI reply');
      }
      const data = await res.json();
      let replyContent = data.response;

      // Extract and execute TABLE_UPDATE_PAYLOAD if present
      const payloadRegex = /\[TABLE_UPDATE_PAYLOAD\]([\s\S]*?)\[\/TABLE_UPDATE_PAYLOAD\]/;
      const match = replyContent.match(payloadRegex);

      if (match && executeTableUpdate) {
        try {
          const payload = JSON.parse(match[1].trim());
          executeTableUpdate(payload);
          replyContent = replyContent.replace(payloadRegex, '').trim();
        } catch (jsonErr) {
          console.error("Failed to parse update command:", jsonErr);
        }
      }

      // Extract and execute INVESTIGATION_UPDATE_PAYLOAD if present
      const invPayloadRegex = /\[INVESTIGATION_UPDATE_PAYLOAD\]([\s\S]*?)\[\/INVESTIGATION_UPDATE_PAYLOAD\]/;
      const invMatch = replyContent.match(invPayloadRegex);

      if (invMatch && onInvestigationUpdate) {
        try {
          const payload = JSON.parse(invMatch[1].trim());
          if (payload.field && payload.value !== undefined) {
            onInvestigationUpdate(payload.field, payload.value);
            replyContent = replyContent.replace(invPayloadRegex, '').trim();
            setChatHistory(h => [...h, { role: 'system', content: `Updated investigation field: ${payload.field}` }]);
          }
        } catch (jsonErr) {
          console.error("Failed to parse investigation update command:", jsonErr);
        }
      }

      setChatHistory(prev => [...prev, { role: 'assistant', content: replyContent }]);
    } catch (err) {
      console.error('Chat endpoint error:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}` }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  return {
    chatOpen,
    setChatOpen,
    chatHistory,
    setChatHistory,
    chatInput,
    setChatInput,
    isLoadingChat,
    handleSendMessage
  };
}
