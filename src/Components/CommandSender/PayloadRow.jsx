import { normalizeToHex, displayValue, getStatesInfo } from "../../utils/utils";

function PayloadRow({ item, value, onHexChange, onStateLabelChange, isHex }) {
    const statesInfo = item.states ? getStatesInfo(item) : null;

    const uiValue = displayValue(value, isHex);

    const handleChange = (e) => {
        const hex = normalizeToHex(e.target.value);
        onHexChange(item.name, hex);
    };

    const handleBlur = (e) => {
        const hex = normalizeToHex(e.target.value);
        onHexChange(item.name, hex);
    };

    return (
        <div className="ce-item-row">
            <div className="ce-item-name">
                <div className="ce-mono">{item.name}</div>
            </div>

            <div className="ce-item-value">
                {statesInfo ? (
                    <select
                        className="ce-select"
                        value={value}
                        onChange={(e) => onStateLabelChange(item.name, e.target.value)}
                    >
                        {statesInfo.options.map((opt) => (
                            <option key={opt.label} value={opt.label}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        className="ce-row-input"
                        value={uiValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                )}
            </div>
        </div>
    );
}

export default PayloadRow;
