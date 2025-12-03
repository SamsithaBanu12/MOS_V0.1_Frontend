import { ToastContainer } from 'react-toastify';
import './App.css'
import Navbar from './Components/Navbar/Navbar';
import CommandSender from './pages/CommandSender';
import { Routes, Route, Navigate } from "react-router-dom";
import { Homepage } from './pages/Homepage';
import ConnectionPage from './pages/ConnectionPage';
import ScheduleUploadPage from './pages/ScheduleUploadPage';
import NetraPage from './pages/NetraPage';
import TransmissionHistoryPage from './pages/TransmissionHistoryPage';
import UploadPage from './pages/UploadPage';
import FileUploadPage from './pages/FileUploadPage';

function App() {

  return (
    <>
      <Navbar />
      <div className="bottom-app-wrapper">
        <Routes>
          <Route path="/command-sender" element={<CommandSender />} />
          <Route path="/connection-setup" element={<ConnectionPage />} />
          <Route path="/" element={<Navigate to="/schedule-upload" replace />} />

        {/* same UploadPage, but URL decides active tab */}
        <Route path="/schedule-upload" element={<ScheduleUploadPage />} />
        <Route path="/file-upload" element={<FileUploadPage />} />
          <Route path="/transmission-history" element={<TransmissionHistoryPage />} />
          <Route path="/netra" element={<NetraPage />} />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
