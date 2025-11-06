import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Imports your main App component with all the routes

// 1. Find the 'root' div element in your public/index.html file.
const rootElement = document.getElementById('root');

// 2. Create a React root to manage rendering for that element.
const root = ReactDOM.createRoot(rootElement);

// 3. Render your main <App /> component inside the React root.
// <React.StrictMode> is a wrapper that helps find potential problems in an app.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
