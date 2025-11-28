function CEHeader() {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
            <header className="ce-header">
                <div>Command Explorer</div>
                <div className="ce-muted">Pick a command. Edit routing + payload. Header is view-only.</div>
            </header>
        </div>
    );
}
export default CEHeader;