import { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const PRESET_MANUALS = ['OSH-Standards-2020-Edition.pdf', 'iata-safety-report-2021.pdf'];

const getStoredManualsMeta = () => {
  const defaultPresets = [
    { filename: 'OSH-Standards-2020-Edition.pdf', isPreset: true, uploadedBy: 'system', status: 'approved' },
    { filename: 'iata-safety-report-2021.pdf', isPreset: true, uploadedBy: 'system', status: 'approved' }
  ];
  let deletedPresets = [];
  try {
    deletedPresets = JSON.parse(localStorage.getItem('safira_deleted_presets') || '[]');
  } catch (e) {}

  const activePresets = defaultPresets.filter(p => !deletedPresets.includes(p.filename));
  let meta = [...activePresets];

  try {
    const stored = localStorage.getItem('safira_manuals_metadata');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const fname = typeof item === 'string' ? item : item.filename;
          if (fname && !meta.some(m => m.filename === fname)) {
            if (!PRESET_MANUALS.includes(fname) || !deletedPresets.includes(fname)) {
              meta.push(typeof item === 'string' ? { filename: item, isPreset: PRESET_MANUALS.includes(item), uploadedBy: 'system', status: 'approved' } : item);
            }
          }
        });
      }
    }
  } catch (e) {}
  localStorage.setItem('safira_manuals_metadata', JSON.stringify(meta));
  return meta;
};

const saveStoredManualsMeta = (metaArray) => {
  localStorage.setItem('safira_manuals_metadata', JSON.stringify(metaArray));
};

export default function useSafetyManuals(authedFetch, user) {
  const [showManualsModal, setShowManualsModal] = useState(false);
  const [manuals, setManuals] = useState(() => getStoredManualsMeta());
  const [isLoadingManuals, setIsLoadingManuals] = useState(false);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [manualsAlert, setManualsAlert] = useState({ type: '', message: '' });

  // Load safety manuals instantly
  const fetchManuals = useCallback(async () => {
    const localMeta = getStoredManualsMeta();
    setManuals(localMeta);
    setIsLoadingManuals(false);

    try {
      const res = await authedFetch(`${API_URL}/api/ai/documents`).catch(() => null);
      if (res && res.ok) {
        const backendDocs = await res.json().catch(() => []);
        if (Array.isArray(backendDocs) && backendDocs.length > 0) {
          let metaList = [...localMeta];
          backendDocs.forEach(filename => {
            if (!metaList.some(m => m.filename === filename)) {
              const isPreset = PRESET_MANUALS.includes(filename);
              metaList.push({
                filename,
                isPreset,
                uploadedBy: isPreset ? 'system' : 'User',
                status: isPreset ? 'approved' : 'pending'
              });
            }
          });
          saveStoredManualsMeta(metaList);
          setManuals(metaList);
        }
      }
    } catch (err) {
      console.error('Error fetching manuals in background:', err);
    }
  }, [authedFetch]);

  const handleOpenManualsModal = () => {
    setShowManualsModal(true);
    setManualsAlert({ type: '', message: '' });
    fetchManuals();
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUploadFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) {
      setManualsAlert({ type: 'error', message: 'Only .pdf and .txt files are supported.' });
      return;
    }

    setIsUploadingManual(true);
    setManualsAlert({ type: 'info', message: `Processing and ingesting ${file.name}...` });

    try {
      const base64Data = await fileToBase64(file);
      const res = await authedFetch(`${API_URL}/api/ai/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64_data: base64Data
        })
      }).catch(() => null);

      const isPreset = PRESET_MANUALS.includes(file.name);
      const isAdmin = user?.username === 'ADM-000';
      const newMeta = {
        filename: file.name,
        isPreset,
        uploadedBy: user?.username || 'User',
        status: (isAdmin || isPreset) ? 'approved' : 'pending'
      };

      const currentMeta = getStoredManualsMeta().filter(m => m.filename !== file.name);
      const updatedMeta = [newMeta, ...currentMeta];
      saveStoredManualsMeta(updatedMeta);
      setManuals(updatedMeta);

      if (res && res.ok) {
        setManualsAlert({
          type: 'success',
          message: isAdmin || isPreset
            ? `Successfully uploaded "${file.name}"!`
            : `Successfully uploaded "${file.name}" to your account (${user?.username}). Pending admin approval for global access.`
        });
      } else {
        setManualsAlert({
          type: 'success',
          message: `Uploaded "${file.name}" to your key account (${user?.username}).`
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      const isPreset = PRESET_MANUALS.includes(file.name);
      const isAdmin = user?.username === 'ADM-000';
      const newMeta = {
        filename: file.name,
        isPreset,
        uploadedBy: user?.username || 'User',
        status: (isAdmin || isPreset) ? 'approved' : 'pending'
      };
      const currentMeta = getStoredManualsMeta().filter(m => m.filename !== file.name);
      const updatedMeta = [newMeta, ...currentMeta];
      saveStoredManualsMeta(updatedMeta);
      setManuals(updatedMeta);
      setManualsAlert({ type: 'success', message: `Saved "${file.name}" to your key account (${user?.username}).` });
    } finally {
      setIsUploadingManual(false);
    }
  };

  const handleApproveManual = (filename) => {
    const currentMeta = getStoredManualsMeta();
    const updatedMeta = currentMeta.map(m => {
      if (m.filename === filename) {
        return { ...m, status: 'approved' };
      }
      return m;
    });
    saveStoredManualsMeta(updatedMeta);
    setManuals(updatedMeta);
    setManualsAlert({ type: 'success', message: `Approved "${filename}" for all users!` });
  };

  const handleDeleteManual = async (filename) => {
    const isAdmin = user?.username === 'ADM-000';
    const isPreset = PRESET_MANUALS.includes(filename);

    if (!isAdmin && isPreset) {
      setManualsAlert({ type: 'error', message: 'Preset system manuals can only be deleted by the Admin key (ADM-000).' });
      return;
    }

    setManualsAlert({ type: 'info', message: `Deleting ${filename}...` });

    try {
      await authedFetch(`${API_URL}/api/ai/documents?name=${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      }).catch(() => null);
    } catch (e) {}

    if (isPreset) {
      try {
        const deletedPresets = JSON.parse(localStorage.getItem('safira_deleted_presets') || '[]');
        if (!deletedPresets.includes(filename)) {
          deletedPresets.push(filename);
          localStorage.setItem('safira_deleted_presets', JSON.stringify(deletedPresets));
        }
      } catch (e) {}
    }

    try {
      const stored = localStorage.getItem('safira_manuals_metadata');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter(m => (typeof m === 'string' ? m : m.filename) !== filename);
        localStorage.setItem('safira_manuals_metadata', JSON.stringify(filtered));
      }
    } catch (e) {}

    setManuals(prev => prev.filter(m => (typeof m === 'string' ? m : m.filename) !== filename));
    setManualsAlert({ type: 'success', message: `Successfully deleted "${filename}"` });
  };

  return {
    showManualsModal,
    setShowManualsModal,
    manuals,
    isLoadingManuals,
    isUploadingManual,
    dragOver,
    setDragOver,
    manualsAlert,
    setManualsAlert,
    fetchManuals,
    handleOpenManualsModal,
    handleUploadFile,
    handleApproveManual,
    handleDeleteManual
  };
}
