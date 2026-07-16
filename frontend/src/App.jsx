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
