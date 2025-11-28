import React from "react";
import { ToggleStyled } from "./ToggleStyled";

function Toggle({ inHex, setInHex }) {
  const handleToggle = () => {
    setInHex(!inHex);
  };

  return (
    <ToggleStyled $active={inHex}>
      <div className="label" data-active={!inHex}>
        Number
      </div>
      <div className="toggleButton" onClick={handleToggle}>
        <div className="toggleCircle" />
      </div>
      <div className="label" data-active={inHex}>
        Hex
      </div>
    </ToggleStyled>
  );
}

export default Toggle;
