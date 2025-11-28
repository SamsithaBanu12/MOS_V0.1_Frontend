import styled from "styled-components";

export const NavbarStyled = styled.div`
  .navbarWrapper {
    background-color: #10344d;
    border-radius: 8px;
    padding: 0 15px;
    margin: 10px 5px;
    display: flex;
    align-items: center;
    gap: 40px;
    height: 55px;
    position: relative;
    z-index: 100;

    .left-nav {
      display: flex;
      align-items: center;
      gap: 25px;
    }
       .utc-time {
      margin-left: auto;
      color: white;
      font-size: 19px;
      font-weight: 500;
      border-radius: 8px;
      padding: 8px 12px;
      border: 1px solid #30586b;
    }

    .main-sections {
      display: flex;
      gap: 10px;
      position: relative;
    }
      .group-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 16px !important;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s;
        padding: 10px 15px;
      }

      .group-btn:hover {
        color: #00ffff;
      }
      .group-btn--active {
        font-weight: 600;
        color:rgba(0, 255, 255, 0.7);  
      }

    .group {
      position: relative;

      .group-btn {
        background: transparent;
        border: none;
        color: white;
        font-size: 19px !important;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.2s;
        padding: 10px 15px;
      }

      .group-btn:hover {
        color: #00ffff;
      }

      .dropdown {
        position: absolute;
        top: 100%; /* directly below */
        left: 0;
        background: #0b202e;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        min-width: 200px;
        z-index: 10;
        padding: 8px 0;
        display: flex;
        flex-direction: column;
      }

      .nav-link {
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        transition: background 0.3s;
      }

      .nav-link:hover {
        background: #143f58;
      }

      .nav-link.active {
        background: #00bcd4;
        color: #fff;
      }
    }

    .utc-time {
      margin-left: auto;
      color: white;
      font-size: 19px;
      font-weight: 500;
      border-radius: 8px;
      padding: 8px 12px;
      border: 1px solid #30586b;
    }

    .logo-image {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
    }
  }
`;
