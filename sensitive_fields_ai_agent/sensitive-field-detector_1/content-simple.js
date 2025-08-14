// ULTRA SIMPLE CONTENT SCRIPT TEST
console.log('🎯🎯🎯 CONTENT SCRIPT WORKING! 🎯🎯🎯');
console.log('🎯 Page URL:', window.location.href);
console.log('🎯 Page loaded!');

// Immediate test
alert('🔍 Extension content script is working!');

// Add visual indicator
try {
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;background:red;color:white;padding:10px;z-index:99999;text-align:center;';
  div.textContent = '🔍 EXTENSION CONTENT SCRIPT LOADED!';
  document.documentElement.appendChild(div);
  
  setTimeout(() => {
    div.remove();
  }, 5000);
} catch (e) {
  console.log('🎯 Error adding visual indicator:', e);
}
