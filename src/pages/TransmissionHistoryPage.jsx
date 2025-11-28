import { useEffect, useState } from "react";
import TransmissionHistory from "../Components/TransmissionHistory/TransmissionHistory";

function TransmissionHistoryPage() {
    const [transmissionData, setTransmissionData] = useState([]);
    const [err, setErr] = useState();

    useEffect(() => {
        async function loadPackets() {
            try {
                const res = await fetch("http://localhost:8012/packets?limit=100");
                const data = await res.json();
                setTransmissionData(data);
            } catch (err) {
                console.error("API error:", err);
                setErr(err);
            }
        }

        loadPackets();
    }, []);

    return (
        <>
            {err ? <div>Fetching error: {err}</div> : <TransmissionHistory transmissionData={transmissionData} />}
        </>
    )
}
export default TransmissionHistoryPage;