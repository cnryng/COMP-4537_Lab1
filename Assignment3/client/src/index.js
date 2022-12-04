import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'
import AdminDashboard from "./AdminDashboard";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <>
      <React.StrictMode>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/admin" element={<AdminDashboard/>} />
              </Routes>
          </BrowserRouter>
      </React.StrictMode>
  </>
);
