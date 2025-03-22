import { useEffect } from 'react';
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