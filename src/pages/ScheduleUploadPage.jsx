import ScheduleUpload from "../Components/ScheduleUpload/ScheduleUpload";
import UploadPage from "./UploadPage";

const ScheduleUploadPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <UploadPage />
            <ScheduleUpload />
        </div>
    )
};
export default ScheduleUploadPage;