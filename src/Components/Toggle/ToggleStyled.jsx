import styled from "styled-components";

export const ToggleStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top:10px;

  .label {
    color: ${(props) => (props.$active ? "#9ca3af" : "#fff")};
    font-weight: 400;
    font-size: 13px;

    &:last-child {
      color: ${(props) => (props.$active ? "#fff" : "#9ca3af")};
      font-weight: ${(props) => (props.$active ? "600" : "normal")};
    }
  }

  .toggleButton {
    width: 40px;
    height: 22px;
    display: flex;
    align-items: center;
    border-radius: 9999px;
    padding: 0px;
    background-color: ${(props) => (props.$active ? "#8595dcff" : "#d1d5db")};
    transition: background-color 0.3s ease;
    font-size: 12px;
    cursor: pointer;
  }

  .toggleCircle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
    transform: ${(props) =>
      props.$active ? "translateX(20px)" : "translateX(0)"};
    transition: transform 0.3s ease;
  }
`;
