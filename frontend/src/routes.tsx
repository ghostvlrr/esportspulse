import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import News from './pages/News';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import Sidebar from './components/Sidebar';

const AppRoutes: React.FC = () => {
  return (
    <>
      <Sidebar />
      <main className="main-content">
        <div className="content">
          <Routes>
            <Route path="/" element={<Matches />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/news" element={<News />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default AppRoutes; 