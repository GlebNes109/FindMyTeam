import React, { useEffect, useState } from "react";
import {
    Box,
    Toolbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {apiFetch, refreshAccessToken} from "../apiClient.js";
import HeroSection from "../components/MainPage/HeroSection.jsx";
import EventsSection from "../components/MainPage/EventsSection.jsx";
import SupportedEventsSection from "../components/MainPage/SupportedEventsSection.jsx";
import FAQSection from "../components/MainPage/FAQSection.jsx";
import Footer from "../components/MainPage/Footer.jsx";

function MainPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [participations, setParticipations] = useState([]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const eventsRes = await apiFetch("/events");
                const eventsData = await eventsRes.json();

                let partsData = [];
                try {
                    const partsRes = await apiFetch("/participants", { suppressAuthFailure: true });
                    partsData = await partsRes.json();
                } catch (err) {
                    if (err.code === "UNABLE_TO_UPDATE_TOKEN" || err.status === 401) {
                        partsData = [];
                    } else {
                        console.error("Ошибка при загрузке участников:", err);
                    }
                }

                setEvents(eventsData);
                setParticipations(partsData);
            } catch (err) {
                console.error("Ошибка загрузки:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        refreshAccessToken()
            .then(() => setIsLoggedIn(true))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const participationMap = participations.reduce((acc, p) => {
        acc[p.event_id] = p;
        return acc;
    }, {});

    return (
        <>
            <Toolbar />
            <HeroSection isLoggedIn={isLoggedIn} />
            <EventsSection 
                events={events} 
                loading={loading} 
                participationMap={participationMap}
            />
            <SupportedEventsSection />
            <FAQSection />
            <Footer />
        </>
    );
}

export default MainPage;
