import { ToastContainer } from 'react-toastify';
import './App.css'
import Navbar from './Components/Navbar/Navbar';
import CommandSender from './pages/CommandSender';
import { Routes, Route } from "react-router-dom";
import { Homepage } from './pages/Homepage';
import ConnectionPage from './pages/ConnectionPage';
import ScheduleUploadPage from './pages/ScheduleUploadPage';
import NetraPage from './pages/NetraPage';
import TransmissionHistoryPage from './pages/TransmissionHistoryPage';

function App() {

  return (
    <>
      <Navbar />
      <div className="bottom-app-wrapper">
        <Routes>
          <Route path="/command-sender" element={<CommandSender />} />
          <Route path="/connection-setup" element={<ConnectionPage />} />
          <Route path="/schedule-upload" element={<ScheduleUploadPage />} />
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
