// App.jsx
import React, { useEffect } from 'react';
import {BrowserRouter as Router, Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import Navbar from './components/NavBar.jsx';
import MainPage from './pages/MainPage.jsx';
import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import RegistrationEventPage from "./pages/RegistrationEventPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import ParticipantPage from "./pages/ParticipantPage.jsx";
import {setAuthFailureHandler} from "./authHandler.js";
import AuthPage from "./pages/AuthPage.jsx";
import theme from './theme';
import {CssVarsProvider} from "@mui/material";

function AppRoutesWithAuthHandler() {
    const navigate = useNavigate();
    const location = useLocation()

    useEffect(() => {
        setAuthFailureHandler(() => {
            navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
        });
    }, [navigate]);

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/auth" element={<AuthPage />} />
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
        <CssVarsProvider theme={theme}>

        <Router>
            <AppRoutesWithAuthHandler />
        </Router>
        </CssVarsProvider>
    );
}

export default App;
