import { NavLink } from "react-router-dom";
import { NavbarStyled } from "./NavbarStyled";
import { useState, useEffect } from "react";

const Navbar = ({ onBarClicked }) => {
  const [now, setNow] = useState(() => new Date());
  const [activeGroup, setActiveGroup] = useState(null); // (currently unused)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcStr = now.toISOString().replace("T", " ").slice(0, 19);

  return (
    <NavbarStyled>
      <nav className="navbarWrapper">
        <div className="left-nav">
          <NavLink to="/">
            <img
              src="/galaxeye-logo.png"
              alt="Logo"
              className="logo-image"
            />
          </NavLink>

          {/* Main Hierarchical Nav */}
          <div className="main-sections">
            <NavLink
              to="/connection-setup"
              className={({ isActive }) =>
                `group-btn${isActive ? " group-btn--active" : ""}`
              }
            >
              Connection Setup
            </NavLink>

            <NavLink
              to="/command-sender"
              className={({ isActive }) =>
                `group-btn${isActive ? " group-btn--active" : ""}`
              }
            >
              Command Sender
            </NavLink>

            <NavLink
              to="/schedule-upload"
              className={({ isActive }) =>
                `group-btn${isActive ? " group-btn--active" : ""}`
              }
            >
              Schedule Upload
            </NavLink>
            <NavLink
              to="/transmission-history"
              className={({ isActive }) =>
                `group-btn${isActive ? " group-btn--active" : ""}`
              }
            >
              Transmission History
            </NavLink>
            <NavLink
              to="/netra"
              className={({ isActive }) =>
                `group-btn${isActive ? " group-btn--active" : ""}`
              }
            >
              Netra
            </NavLink>
          </div>
        </div>

        <div className="utc-time">UTC Time: {utcStr}</div>
      </nav>
    </NavbarStyled>
  );
};

export default Navbar;
