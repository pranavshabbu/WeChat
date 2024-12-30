import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import Homepage from './pages/Homepage';
import Signuppage from './pages/Signuppage';
import Loginpage from './pages/Loginpage';
import Settingspage from './pages/Settingspage';
import Profilepage from './pages/Profilepage';
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const {authUser, checkAuth, onlineUsers} = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <Homepage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <Signuppage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <Loginpage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <Profilepage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App