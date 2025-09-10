import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Endpoints from './components/Endpoints';
import Requests from './components/Requests';
import RequestDetail from './components/RequestDetail';
import { Webhook, List, Settings } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Webhook },
    { path: '/endpoints', label: 'Endpoints', icon: Settings },
    { path: '/requests', label: 'Requests', icon: List }
  ];

  return (
    <nav className="nav">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          className={`nav-button ${location.pathname === path ? 'active' : ''}`}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        
        <header className="header">
          <div className="container">
            <h1>Webhook Catcher</h1>
            <p>Development tool for capturing and analyzing webhook requests</p>
          </div>
        </header>

        <div className="container">
          <Navigation />
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/endpoints" element={<Endpoints />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
