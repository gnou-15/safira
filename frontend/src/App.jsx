import useReports from './hooks/useReports';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import DocumentSheet from './components/DocumentSheet';
import ChatbotSidebar from './components/ChatbotSidebar';
import NewReportModal from './components/NewReportModal';
import SafetyManualsModal from './components/SafetyManualsModal';
import BufferLoader from './components/BufferLoader';
import LoginPage from './components/LoginPage';
import './css/App.css';

function App() {
  const {
    user,
    setUser,
    currentPage,
    setCurrentPage,
    handleLogin,
    handleSignup,
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
    handleExitToLanding,
    loadingMessage
  } = useReports();


  return (
    <div className={`app-container ${!currentReport ? 'landing-active' : ''}`}>
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
      />

      {/* Main Workspace */}
      <main className="main-workspace">
        
        {/* Center Canvas */}
        <section className="document-workspace">
          {currentReport ? (
            <DocumentSheet
              currentReport={currentReport}
              rows={rows}
              handleCellEdit={handleCellEdit}
              handleMetaEdit={handleMetaEdit}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
            />
          ) : (
            <LandingPage
              user={user}
              setCurrentPage={setCurrentPage}
              handleNavigate={handleNavigate}
              reports={reports}
              loadReport={loadReport}
              handleGetToWork={handleGetToWork}
              handleOpenManualsModal={handleOpenManualsModal}
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
          handleSendMessage={handleSendMessage}
        />
      </main>

      {/* Unsaved Changes Banner */}
      {showSavePrompt && hasChanges && (
        <div className="save-prompt-banner">
          <span>⚠️ You have unsaved table modifications. Confirm updates?</span>
          <button className="save-btn-confirm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Sync to Supabase'}
          </button>
          <button className="save-btn-discard" onClick={handleDiscard} disabled={isSaving}>
            Discard
          </button>
        </div>
      )}

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
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          isGenerating={isGenerating}
          onBackToHome={() => handleNavigate('landing')}
          setUser={setUser}
          handleNavigate={handleNavigate}
        />
      )}

      {isPageLoading && <BufferLoader message={loadingMessage} />}
    </div>
  );
}

export default App;
