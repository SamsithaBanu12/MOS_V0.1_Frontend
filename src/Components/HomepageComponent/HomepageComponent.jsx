// src/components/HomePage.jsx
import React from 'react';
import './HomePageComponent.css';
import logo from '../../assets/glx.jpeg';

const HomepageComponent = () => {
  return (
    <div className="home-container">
      <div className="overlay" />
      <img src={logo} alt="GalaxEye Logo" className="logo" />
      <div className="text-container">
        <h1>GalaxEye</h1>
        <h2>Mission Control Software</h2>
        <p className="alpha-tag">Alpha Test Release</p>
        <p className="scenario-note">Includes Prebuilt Mission Scenario</p>
        <footer>Made by GalaxEye</footer>
      </div>
    </div>
  );
};

export default HomepageComponent;
