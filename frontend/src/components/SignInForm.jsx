import React, { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { apiFetch } from "../apiClient.js";
import { setAccessToken } from "../tokenStore.js";

const SignInForm = ({ onSuccess, switchToRegister }) => {
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const LoginRequest = async () => {
        try {
            const response = await apiFetch("/users/signin", {
                method: "POST",
                body: JSON.stringify({ login, password }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    setErrorMessage("Неверный логин или пароль");
                } else if (response.status === 400) {
                    setErrorMessage("Некорректные значения или поля не заполнены");
                } else {
                    setErrorMessage("HTTP ошибка: " + response.status);
                }
                return;
            }

            const data = await response.json();
            setAccessToken(data.access_token);
            onSuccess();
        } catch {
            setErrorMessage("Ошибка при попытке входа");
        }
    };

    return (
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button variant="outlined" fullWidth onClick={LoginRequest}>
                    Войти
                </Button>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
    );
};

export default SignInForm;
