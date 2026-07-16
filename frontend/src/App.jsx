import { useState } from 'react';
import useReports from './hooks/useReports';
import Header from './components/Header';
import LandingPage from './routes/LandingPage';
import DocumentSheet from './routes/DocumentSheet';
import InvestigationReport from './routes/InvestigationReport';
import ChatbotSidebar from './components/ChatbotSidebar';
import NewReportModal from './components/NewReportModal';
import SafetyManualsModal from './components/SafetyManualsModal';
import BufferLoader from './components/BufferLoader';
import LoginPage from './routes/LoginPage';
import DocumentSkeleton from './components/DocumentSkeleton';
import useInvestigations from './hooks/useInvestigations';
import NewInvestigationModal from './components/NewInvestigationModal';
import './css/App.css';

function App() {
  const {
    user,
    setUser,
    currentPage,
    setCurrentPage,
    handleKeyLogin,
    handleKeyGenerate,
    handleLogout,
    handleNavigate,
    reports,
    isPageLoading,
    currentReport,
    setCurrentReport,
    rows,
    isSaving,
    hasChanges,
    showSavePrompt,
    lastSaved,
    chatOpen,
    setChatOpen,
    chatHistory,
    chatInput,
    setChatInput,
    isLoadingChat,
    showModal,
    setShowModal,
    incidentPrompt,
    setIncidentPrompt,
    isGenerating,
    newReportMeta,
    setNewReportMeta,
    showManualsModal,
    setShowManualsModal,
    manuals,
    isLoadingManuals,
    isUploadingManual,
    dragOver,
    setDragOver,
    manualsAlert,
    fetchReports,
    loadReport,
    handleSave,
    handleDiscard,
    handleAddRow,
    handleDeleteRow,
    handleOpenManualsModal,
    handleUploadFile,
    handleDeleteManual,
    handleCellEdit,
    handleMetaEdit,
    handleGetToWork,
    handleCreateReport,
    handleSendMessage,
    handlePrint,
    handleDeleteReport,
    handleExitToLanding,
    loadingMessage,
    isReportLoading
  } = useReports();

  const {
    investigations,
    currentInvestigation,
    isLoadingInvestigations,
    isGeneratingInvestigation,
    hasInvestigationChanges,
    investigationLoadingMessage,
    showInvestigationModal,
    setShowInvestigationModal,
    loadInvestigation,
    handleCreateInvestigation,
    handleFieldEdit: handleInvestigationFieldEdit,
    handleDeleteInvestigation,
    handleExitInvestigation,
    handleSaveExplicit: handleInvestigationSaveExplicit
  } = useInvestigations(user, setCurrentPage);

  const handleGetToWorkInvestigation = async () => {
    if (investigations.length > 0) {
      await loadInvestigation(investigations[0].id);
    } else {
      setShowInvestigationModal(true);
    }
  };

  return (
    <div className={`app-container ${(!currentReport && !currentInvestigation) ? 'landing-active' : ''} ${currentPage === 'login' ? 'login-active' : ''}`}>
      {/* Top Navbar */}
      <Header
        user={user}
        handleLogout={handleLogout}
        setCurrentPage={setCurrentPage}
        handleNavigate={handleNavigate}
        currentReport={currentReport}
        setCurrentReport={setCurrentReport}
        handleExitToLanding={handleExitToLanding}
        reports={reports}
        loadReport={loadReport}
        handleGetToWork={handleGetToWork}
        handleOpenManualsModal={handleOpenManualsModal}
        setShowModal={setShowModal}
        handlePrint={handlePrint}
        fetchReports={fetchReports}
        isSaving={isSaving}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        handleKeyLogin={handleKeyLogin}
        currentInvestigation={currentInvestigation}
        investigations={investigations}
        loadInvestigation={loadInvestigation}
        setShowInvestigationModal={setShowInvestigationModal}
        hasInvestigationChanges={hasInvestigationChanges}
        handleExitInvestigation={handleExitInvestigation}
      />

      {/* Main Workspace */}
      <main className="main-workspace">
        
        {/* Workspace Background Silhouettes (Rendered behind active worksheet canvas) */}
        {(currentPage === 'investigation' || currentReport) && (
          <div className="workspace-bg-container screen-only">
            {/* Left Tower Silhouette */}
            <svg viewBox="0 0 120 180" className="bg-silhouette-left">
              <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="0" y1="170" x2="120" y2="170" strokeWidth="2" opacity="0.4" />
                <path d="M50 170 L58 90 M70 170 L62 90" opacity="0.6" />
                <path d="M58 90 L53 85 L67 85 L62 90" />
                <polygon points="46,85 74,85 78,65 42,65" />
                <line x1="53" y1="85" x2="50" y2="65" />
                <line x1="60" y1="85" x2="60" y2="65" />
                <line x1="67" y1="85" x2="70" y2="65" />
                <path d="M42 65 L60 55 L78 65" />
                <line x1="60" y1="55" x2="60" y2="30" />
                <circle cx="60" cy="30" r="1.5" fill="currentColor" />
                <path d="M15 170 L20 150 M12 146 A 12,12 0 0,1 28,146" opacity="0.5" />
              </g>
            </svg>

            {/* Left Windsock Silhouette */}
            <svg viewBox="0 0 80 100" className="bg-silhouette-windsock">
              <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="20" y1="90" x2="20" y2="30" strokeWidth="2.5" opacity="0.5" />
                <path d="M 20,30 L 35,27 L 35,43 L 20,40 Z" />
                <path d="M 35,27 L 50,30 L 50,40 L 35,43" />
                <path d="M 50,30 L 62,33 L 62,37 L 50,40" />
              </g>
            </svg>

            {/* Left Hangar Silhouette */}
            <svg viewBox="0 0 120 80" className="bg-silhouette-hangar">
              <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 10,70 A 50,50 0 0,1 110,70" />
                <line x1="5" y1="70" x2="115" y2="70" strokeWidth="2" opacity="0.5" />
                <rect x="35" y="45" width="50" height="25" />
                <line x1="60" y1="45" x2="60" y2="70" />
              </g>
            </svg>

            {/* Right Compass Rose Silhouette */}
            <svg viewBox="0 0 100 100" className="bg-silhouette-compass">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
              <path d="M 50,8 L 50,92 M 8,50 L 92,50" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
              <polygon points="50,15 47,38 53,38" fill="currentColor" />
              <polygon points="50,85 47,62 53,62" fill="currentColor" opacity="0.4" />
              <polygon points="15,50 38,47 38,53" fill="currentColor" opacity="0.4" />
              <polygon points="85,50 62,47 62,53" fill="currentColor" opacity="0.4" />
            </svg>

            {/* Right Airplane Silhouette */}
            <svg viewBox="0 0 160 120" className="bg-silhouette-right">
              <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 20,80 Q 80,45 135,35 Q 85,55 35,85 Z" />
                <polygon points="75,54 50,15 62,13 90,48" />
                <polygon points="32,79 12,102 24,104 42,75" />
                <polygon points="26,82 15,90 18,92 32,80" />
                <path d="M 70,59 L 85,53 L 83,50 L 68,56 Z" fill="currentColor" opacity="0.4" />
                <path d="M 5,88 Q 15,84 25,78" opacity="0.25" strokeWidth="1" />
                <path d="M 1,93 Q 10,89 20,83" opacity="0.15" strokeWidth="1" />
              </g>
            </svg>

            {/* Right Distant Jet Airplane Silhouette */}
            <svg viewBox="0 0 160 120" className="bg-silhouette-plane-far">
              <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 20,80 Q 80,45 135,35 Q 85,55 35,85 Z" />
                <polygon points="75,54 50,15 62,13 90,48" />
                <polygon points="32,79 12,102 24,104 42,75" />
              </g>
            </svg>
          </div>
        )}

        {/* Center Canvas */}
        <section className="document-workspace">
          {isReportLoading ? (
            <DocumentSkeleton />
          ) : currentPage === 'investigation' ? (
            <InvestigationReport
              currentInvestigation={currentInvestigation}
              handleFieldEdit={handleInvestigationFieldEdit}
              handleDeleteInvestigation={handleDeleteInvestigation}
              hasChanges={hasInvestigationChanges}
              handleExitToLanding={handleExitInvestigation}
            />
          ) : currentReport ? (
            <DocumentSheet
              currentReport={currentReport}
              rows={rows}
              handleCellEdit={handleCellEdit}
              handleMetaEdit={handleMetaEdit}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              handleDeleteReport={handleDeleteReport}
            />
          ) : (
            <LandingPage
              user={user}
              setCurrentPage={setCurrentPage}
              handleNavigate={handleNavigate}
              reports={reports}
              investigations={investigations}
              loadReport={loadReport}
              loadInvestigation={loadInvestigation}
              handleGetToWork={handleGetToWork}
              handleGetToWorkInvestigation={handleGetToWorkInvestigation}
              handleOpenManualsModal={handleOpenManualsModal}
              handleKeyLogin={handleKeyLogin}
            />
          )}
        </section>

        {/* Floating chatbot overlay at bottom right */}
        <ChatbotSidebar
          chatOpen={chatOpen}
          setChatOpen={setChatOpen}
          chatHistory={chatHistory}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isLoadingChat={isLoadingChat}
          handleSendMessage={(e) => handleSendMessage(e, currentReport, currentInvestigation)}
        />
      </main>



      {/* Initial Prompt Generation Modal */}
      <NewReportModal
        showModal={showModal}
        setShowModal={setShowModal}
        newReportMeta={newReportMeta}
        setNewReportMeta={setNewReportMeta}
        incidentPrompt={incidentPrompt}
        setIncidentPrompt={setIncidentPrompt}
        handleCreateReport={handleCreateReport}
        isGenerating={isGenerating}
      />

      {/* New Investigation Report Modal */}
      <NewInvestigationModal
        showModal={showInvestigationModal}
        setShowModal={setShowInvestigationModal}
        handleCreateReport={handleCreateInvestigation}
        isGenerating={isGeneratingInvestigation}
      />

      {/* Safety Manuals Ingestion/Management Modal */}
      <SafetyManualsModal
        showManualsModal={showManualsModal}
        setShowManualsModal={setShowManualsModal}
        manuals={manuals}
        isLoadingManuals={isLoadingManuals}
        isUploadingManual={isUploadingManual}
        dragOver={dragOver}
        setDragOver={setDragOver}
        manualsAlert={manualsAlert}
        handleUploadFile={handleUploadFile}
        handleDeleteManual={handleDeleteManual}
      />

      {currentPage === 'login' && (
        <LoginPage 
          handleKeyLogin={handleKeyLogin}
          handleKeyGenerate={handleKeyGenerate}
          onBackToHome={() => handleNavigate('landing')}
          setUser={setUser}
          handleNavigate={handleNavigate}
        />
      )}

      {(isPageLoading || isLoadingInvestigations) && (
        <BufferLoader message={loadingMessage || investigationLoadingMessage} />
      )}
    </div>
  );
}

export default App;
