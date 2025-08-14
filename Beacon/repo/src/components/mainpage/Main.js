import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const styles = {
  container: {
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  content: {
    paddingTop: '64px',
    minHeight: 'calc(100vh - 64px)',
    position: 'relative',
  }
};

const Main = () => {
  return (
    <div style={styles.container}>
      <NavBar />
      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default Main; 