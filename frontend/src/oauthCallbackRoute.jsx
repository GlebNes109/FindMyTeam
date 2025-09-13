import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {Box, CircularProgress} from "@mui/material";
import {apiFetch} from "./apiClient.js";
import {setAccessToken} from "./tokenStore.js";
import {useToast} from "./components/ToastProvider.jsx"; // твой существующий код

export function OAuthCallback() {
    const { search } = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const code = params.get("code");
        const provider = params.get("state");

        if (code && provider) {
            // отправка code на бэк
            console.log(code)
            apiFetch(`/users/auth/${provider}/callback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: code}),
            })
                .then(res => res.json())
                .then(data => {
                    setAccessToken(data.access_token);
                    navigate("/home"); // редирект после логина
                })
                .catch(err => {
                    console.error("OAuth login failed", err);
                    showToast('error', 'Используйте другой способ входа. Скоро все исправим');
                    navigate("/auth");
                });
        } else {
            showToast('error', 'Используйте другой способ входа. Скоро все исправим');
            //navigate("/auth"); // если нет code
        }
    }, [search, navigate]);

    return (<Box
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
        }}
    >
        <CircularProgress />
    </Box>)
}
