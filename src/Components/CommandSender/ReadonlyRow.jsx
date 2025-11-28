import { getDefaultDisplay, getDisplayValue } from "../../utils/utils";

function ReadonlyRow({ item, isHex }) {
    const defVal = getDefaultDisplay(item) ?? "—";
    const show = getDisplayValue(isHex, defVal);
    return (
        <div className="ce-item-row1">
            <div className="ce-item-name">
                <div className="ce-mono">{item.name}</div>
                {item.description && <div className="ce-muted1 ce-small1">{item.description}</div>}
            </div>
            <div className="ce-item-value"><div className="ce-chip">{show}</div></div>
        </div>
    );
};
export default ReadonlyRow;