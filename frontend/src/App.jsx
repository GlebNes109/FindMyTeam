// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import MainPage from './pages/MainPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import RegPage from "./pages/RegistrationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import RegistrationEventPage from "./pages/RegistrationEventPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import ParticipantPage from "./pages/ParticipantPage.jsx";
import {setAuthFailureHandler} from "./authHandler.js";

function AppRoutesWithAuthHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        setAuthFailureHandler(() => {
            navigate('/signin');
        });
    }, [navigate]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/signin" element={<LoginPage />} />
                <Route path="/signup" element={<RegPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/event/:eventId" element={<EventPage />} />
                <Route path="/event/:event_id/register" element={<RegistrationEventPage />} />
                <Route path="/team/:teamId" element={<TeamPage />} />
                <Route path="/participant/:participantId" element={<ParticipantPage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppRoutesWithAuthHandler />
        </Router>
    );
}

export default App;
