import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UploadPage.space.css";

function UploadPage() {
    const [activeTab, setActiveTab] = useState("CMD");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/file-upload") {
            setActiveTab("TLM");
        } else {
            setActiveTab("CMD");
        }
    }, [location.pathname]);

    return (
        <div className="up-tabs">
            <button
                className={`up-tab ${activeTab === "CMD" ? "active" : ""}`}
                onClick={() => {
                    setActiveTab("CMD");
                    navigate("/schedule-upload");
                }}
            >
                Schedule Upload
            </button>

            <button
                className={`up-tab ${activeTab === "TLM" ? "active" : ""}`}
                onClick={() => {
                    setActiveTab("TLM");
                    navigate("/file-upload");
                }}
            >
                File Upload
            </button>
        </div>
    );
}

export default UploadPage;
