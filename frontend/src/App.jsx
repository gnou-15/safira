import useReports from './hooks/useReports';
import Header from './components/Header';
import LandingPage from './routes/LandingPage';
import DocumentSheet from './routes/DocumentSheet';
import ChatbotSidebar from './components/ChatbotSidebar';
import NewReportModal from './components/NewReportModal';
import SafetyManualsModal from './components/SafetyManualsModal';
import BufferLoader from './components/BufferLoader';
import LoginPage from './routes/LoginPage';
import DocumentSkeleton from './components/DocumentSkeleton';
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
    handleExitToLanding,
    loadingMessage,
    isReportLoading
  } = useReports();
  return (
    <div className={`app-container ${!currentReport ? 'landing-active' : ''} ${currentPage === 'login' ? 'login-active' : ''}`}>
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
      />

      {/* Main Workspace */}
      <main className="main-workspace">
        
        {/* Center Canvas */}
        <section className="document-workspace">
          {isReportLoading ? (
            <DocumentSkeleton />
          ) : currentReport ? (
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
          handleSendMessage={handleSendMessage}
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

      {isPageLoading && <BufferLoader message={loadingMessage} />}
    </div>
  );
}

export default App;
