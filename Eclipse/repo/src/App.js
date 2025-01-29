/* global chrome */
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  
  useEffect(()=>{
    window.location.href = 'https://tap.eclipse.xyz';
  },[]);
  
  return (
    <div className="App"></div>
  );
}

export default App;