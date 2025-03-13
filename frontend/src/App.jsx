import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar.jsx'; // Импортируем Navbar
import MainPage from './pages/MainPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import RegPage from "./pages/RegistrationPage.jsx";
function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegPage />} />
            </Routes>
        </Router>
    );
}

export default App;
