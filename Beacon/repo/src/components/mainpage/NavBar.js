import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MenuIcon, X, Settings, LogOut, User, Home, Rocket, 
  Database, PlusCircle, Link2, FileText, Twitter 
} from 'lucide-react';

import BeaconLogo from '../../assets/Beaconwb.png';

// Move all styles from Dashboard.js here
const styles = {
  appBar: {
    height: '64px',
    width: '100%',
    background: '#000055FF',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#FF7A00',
    cursor: 'pointer',
    padding: '8px',
  },
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s, visibility 0.3s',
    zIndex: 150,
  },
  menuOverlayVisible: {
    opacity: 1,
    visibility: 'visible',
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: '-300px',
    width: '300px',
    height: '100vh',
    background: '#000055FF',
    transition: 'left 0.3s',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
  },
  
  //@media (max-width: 768px) {width: 200px;}
  '@media (max-width: 768px)': {
    sideMenu: {
      width: '130px',
    },
  },
  sideMenuOpen: {
    left: 0,
  },
  menuHeader: {
    padding: '20px',
    borderBottom: '1px solid #FF7A00',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#FF7A00',
    cursor: 'pointer',
    padding: '8px',
  },
  menuContent: {
    padding: '20px 0',
    flex: 1,
    overflowY: 'auto',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    color: '#FFEBC8FF',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  menuItemActive: {
    background: '#FF7A00',
    color: 'white',
  },
  menuIcon: {
    width: '20px',
    height: '20px',
  },
  profileSection: {
    position: 'relative',
  },
  profileButton: {
    background: 'none',
    border: 'none',
    color: '#FF7A00',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  profileMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: '#000055FF',
    border: '1px solid #FF7A00',
    borderRadius: '4px',
    padding: '8px 0',
    minWidth: '200px',
    display: 'none',
  },
  profileMenuVisible: {
    display: 'block',
  },
  profileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    color: '#FFEBC8FF',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }
};

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarProfileMenuOpen, setIsSidebarProfileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Home');
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    navigate('/SignIn');
  };

  const menuItems = [
    { 
      icon: <User size={20} />, 
      label: 'Profile',
      subItems: [
        { icon: <Settings size={20} />, label: 'Settings', to: '/dashboard/settings' },
        { icon: <LogOut size={20} />, label: 'Logout', onClick: handleLogout }
      ]
    },
    { icon: <Home size={20} />, label: 'Home', to: '/dashboard' },
    { icon: <Rocket size={20} />, label: 'Deployments', to: '/dashboard/deployments' },
    { icon: <Database size={20} />, label: 'View Data', to: '/dashboard/view-data' },
    { icon: <PlusCircle size={20} />, label: 'Create Data', to: '/dashboard/create-data' },
    { icon: <Link2 size={20} />, label: 'Data Unions', to: '/dashboard/data-unions' },
    { icon: <FileText size={20} />, label: 'Documentation', to: '/dashboard/documentation' },
    { icon: <Twitter size={20} />, label: 'Twitter Control', to: '/dashboard/twitter-control' },
  ];

  return (
    <>
      {/* App Bar */}
      <div style={styles.appBar}>
        <button 
          style={styles.menuButton}
          onClick={toggleMenu}
        >
          <MenuIcon size={24} strokeWidth={2} />
        </button>

        <div style={styles.profileSection} ref={profileRef}>
          <button 
            style={styles.profileButton}
            onClick={toggleProfileMenu}
          >
            <User size={24} />
          
          </button>

          <div style={{
            ...styles.profileMenu,
            ...(isProfileMenuOpen && styles.profileMenuVisible)
          }}>
            <Link to="/dashboard/settings" style={{ textDecoration: 'none' }}>
              <div style={styles.profileMenuItem}>
                <Settings size={20} />
                <span>Settings</span>
              </div>
            </Link>
            <div 
              style={styles.profileMenuItem}
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      <div 
        style={{
          ...styles.menuOverlay,
          ...(isMenuOpen && styles.menuOverlayVisible)
        }}
        onClick={toggleMenu}
      />

      {/* Side Menu */}
      <div 
        style={{
          ...styles.sideMenu,
          ...(isMenuOpen && styles.sideMenuOpen)
        }}
      >
        <div style={styles.menuHeader}>
          <img src={BeaconLogo} alt="Beacon Logo" height="40" />
          <button 
            style={styles.closeButton}
            onClick={toggleMenu}
          >
            <X size={24} />
          </button>
        </div>

        <div style={styles.menuContent}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.to ? (
                <Link 
                  to={item.to}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      ...styles.menuItem,
                      ...(activeMenuItem === item.label ? styles.menuItemActive : {}),
                    }}
                    onClick={() => {
                      setActiveMenuItem(item.label);
                      toggleMenu();
                    }}
                  >
                    <span style={styles.menuIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ) : (
                <div
                  style={{
                    ...styles.menuItem,
                    ...(activeMenuItem === item.label ? styles.menuItemActive : {})
                  }}
                  onClick={() => {
                    if (item.subItems) {
                      setIsSidebarProfileMenuOpen(!isSidebarProfileMenuOpen);
                    }
                  }}
                >
                  <span style={styles.menuIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )}

              {/* Show sub-items for profile */}
              {item.subItems && isSidebarProfileMenuOpen && item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  style={{
                    ...styles.menuItem,
                    paddingLeft: '44px'
                  }}
                >
                  {subItem.to ? (
                    <Link 
                      to={subItem.to}
                      style={{ 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'inherit',
                        width: '100%'
                      }}
                      onClick={() => {
                        setActiveMenuItem(subItem.label);
                        toggleMenu();
                      }}
                    >
                      <span style={styles.menuIcon}>{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </Link>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onClick={subItem.onClick}
                    >
                      <span style={styles.menuIcon}>{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavBar;
