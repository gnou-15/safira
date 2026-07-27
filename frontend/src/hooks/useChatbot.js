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

      // Helper to parse JSON items safely
      const parseAndCollectItems = (rawStr, targetArray) => {
        try {
          const parsed = JSON.parse(rawStr);
          if (Array.isArray(parsed)) targetArray.push(...parsed);
          else targetArray.push(parsed);
        } catch (e) {
          try {
            const wrapped = `[${rawStr.replace(/}\s*{/g, '},{')}]`;
            const parsed = JSON.parse(wrapped);
            if (Array.isArray(parsed)) targetArray.push(...parsed);
          } catch (e2) {
            console.error("Failed to parse payload item:", e2);
          }
        }
      };

      // 1. Process HIRAC TABLE_UPDATE_PAYLOAD (tagged & untagged)
      const payloadRegex = /\[TABLE_UPDATE_PAYLOAD\]([\s\S]*?)\[\/TABLE_UPDATE_PAYLOAD\]/gi;
      if (payloadRegex.test(replyContent)) {
        replyContent = replyContent.replace(payloadRegex, (fullMatch, jsonStr) => {
          if (executeTableUpdate) {
            try {
              const payload = JSON.parse(jsonStr.trim());
              executeTableUpdate(payload);
            } catch (jsonErr) {
              console.error("Failed to parse HIRAC table update command:", jsonErr);
            }
          }
          return '';
        }).trim();
      }

      // 2. Process INVESTIGATION_UPDATE_PAYLOAD (tagged, untagged arrays, & untagged objects)
      const invUpdates = [];

      // Pattern A: Tagged [INVESTIGATION_UPDATE_PAYLOAD]...[/INVESTIGATION_UPDATE_PAYLOAD]
      const taggedInvRegex = /\[INVESTIGATION_UPDATE_PAYLOAD\]([\s\S]*?)\[\/INVESTIGATION_UPDATE_PAYLOAD\]/gi;
      let match;
      while ((match = taggedInvRegex.exec(replyContent)) !== null) {
        parseAndCollectItems(match[1].trim(), invUpdates);
      }
      replyContent = replyContent.replace(taggedInvRegex, '').trim();

      // Pattern B: Untagged JSON arrays containing {"field": ...}
      const rawJsonArrayRegex = /\[\s*\{\s*"field"\s*:[\s\S]*?\}\s*\]/gi;
      while ((match = rawJsonArrayRegex.exec(replyContent)) !== null) {
        parseAndCollectItems(match[0], invUpdates);
      }
      replyContent = replyContent.replace(rawJsonArrayRegex, '').trim();

      // Pattern C: Individual untagged JSON objects with {"field": "..."}
      const rawJsonObjectRegex = /\{\s*"field"\s*:\s*"(?:title|executive_summary|operational_irregularity|risk_index|analysis|root_cause|corrective_action|preventive_action)"[\s\S]*?\}/gi;
      while ((match = rawJsonObjectRegex.exec(replyContent)) !== null) {
        parseAndCollectItems(match[0], invUpdates);
      }
      replyContent = replyContent.replace(rawJsonObjectRegex, '').trim();

      // Apply all collected investigation updates to worksheet
      if (onInvestigationUpdate && invUpdates.length > 0) {
        for (const item of invUpdates) {
          if (item && item.field && item.value !== undefined) {
            onInvestigationUpdate(item.field, item.value);
          }
        }
      }

      // Clean up residual tags or bracket artifacts
      replyContent = replyContent
        .replace(/\[\/?(TABLE_UPDATE_PAYLOAD|INVESTIGATION_UPDATE_PAYLOAD)\]/gi, '')
        .replace(/^\s*\[\s*\]\s*$/, '')
        .trim();

      if (!replyContent) {
        replyContent = "I've updated the report for you on the worksheet.";
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
