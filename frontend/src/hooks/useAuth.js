import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function useAuth(setCurrentPage) {
  const [user, setUser] = useState(() => {
    try {
      const cachedToken = localStorage.getItem('safira_token');
      const cachedUser = localStorage.getItem('safira_user');
      return cachedToken && cachedUser ? { token: cachedToken, ...JSON.parse(cachedUser) } : null;
    } catch (e) {
      return null;
    }
  });

  // Authenticated Fetch wrapper helper
  const authedFetch = useCallback(async (url, options = {}) => {
    const token = user?.token || localStorage.getItem('safira_token');
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  }, [user]);

  const handleKeyLogin = async (key) => {
    const res = await fetch(`${API_URL}/api/auth/key-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    const cleanKey = key.trim().toUpperCase();
    const loginUser = { token: data.token, ...data.user };
    setUser(loginUser);
    localStorage.setItem('safira_token', data.token);
    localStorage.setItem('safira_user', JSON.stringify(data.user));
    localStorage.setItem('safira_remembered_key', cleanKey);
    sessionStorage.setItem('safira_current_page', 'landing');
    if (setCurrentPage) setCurrentPage('landing');
    return true;
  };

  const handleKeyGenerate = async () => {
    const res = await fetch(`${API_URL}/api/auth/key-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Key generation failed');

    const loginUser = { token: data.token, ...data.user };
    setUser(loginUser);
    localStorage.setItem('safira_token', data.token);
    localStorage.setItem('safira_user', JSON.stringify(data.user));
    localStorage.setItem('safira_remembered_key', data.key);
    sessionStorage.setItem('safira_current_page', 'landing');
    if (setCurrentPage) setCurrentPage('landing');

    try {
      await navigator.clipboard.writeText(data.key);
    } catch (e) {
      console.warn("Clipboard access failed, key was:", data.key);
    }

    return data.key;
  };

  const handleLogout = async (setLoadingMessage, setIsPageLoading, resetSession) => {
    if (setLoadingMessage) setLoadingMessage("Till we meet again...");
    if (setIsPageLoading) setIsPageLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser(null);
    if (resetSession) resetSession();
    localStorage.removeItem('safira_token');
    localStorage.removeItem('safira_user');
    sessionStorage.removeItem('safira_current_page');
    sessionStorage.removeItem('activeReportId');
    sessionStorage.removeItem('activeReport');
    sessionStorage.removeItem('activeReportRows');
    if (setCurrentPage) setCurrentPage('landing');
    if (setIsPageLoading) setIsPageLoading(false);
  };

  return {
    user,
    setUser,
    authedFetch,
    handleKeyLogin,
    handleKeyGenerate,
    handleLogout
  };
}
