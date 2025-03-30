import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar.jsx'; // Импортируем Navbar
import MainPage from './pages/MainPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import RegPage from "./pages/RegistrationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/signup" element={<RegPage />} />
                <Route path="/homepage" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default App;
