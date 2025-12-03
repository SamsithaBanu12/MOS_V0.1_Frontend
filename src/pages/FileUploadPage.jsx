import FileUpload from "../Components/FileUpload/FileUpload";
import UploadPage from "./UploadPage";

const FileUploadPage = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <UploadPage />
            <FileUpload />
        </div>
    )
};
export default FileUploadPage;