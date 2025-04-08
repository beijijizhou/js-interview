export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://mcp-server-demo.onrender.com';
console.log(API_BASE_URL)