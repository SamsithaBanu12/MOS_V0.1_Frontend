import { normalizeToHex, displayValue } from "../../utils/utils";

function RoutingRow({ item, value, onChange, isHex }) {
    const uiValue = displayValue(value, isHex);

    const handleChange = (e) => {
        const hex = normalizeToHex(e.target.value);
        onChange(item.name, hex);   // store HEX ALWAYS
    };

    const handleBlur = (e) => {
        const hex = normalizeToHex(e.target.value);
        onChange(item.name, hex);
    };

    return (
        <div className="ce-item-row">
            <div className="ce-item-name">
                <div className="ce-mono">{item.name}</div>
            </div>
            <div className="ce-item-value">
                <input
                    className="ce-row-input"
                    value={uiValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    );
}

export default RoutingRow;
