import React from "react";
import "../styles/Navbar.css";
import sapien_logo from "../assets/sapien_logo.png";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={sapien_logo} alt="Sapien" className="logo-image" />
      </div>
    </nav>
  );
};

export default Navbar;