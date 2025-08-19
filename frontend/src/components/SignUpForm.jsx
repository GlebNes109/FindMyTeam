import React, { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { apiFetch } from "../apiClient.js";
import { setAccessToken } from "../tokenStore.js";

const SignUpForm = ({ onSuccess, switchToLogin }) => {
    const [email, setEmail] = useState("");
    const [tg_nickname, setTg_nickname] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const RegisterRequest = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Пароли отличаются");
            return;
        }

        try {
            const response = await apiFetch("/users/signup", {
                method: "POST",
                body: JSON.stringify({ login, password, email, tg_nickname }),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    setErrorMessage("Не все поля заполнены или некорректные значения");
                } else if (response.status === 409) {
                    setErrorMessage("Такой логин или почта уже есть");
                } else {
                    setErrorMessage("HTTP ошибка: " + response.status);
                }
                return;
            }

            const data = await response.json();
            setAccessToken(data.access_token);
            onSuccess();
        } catch {
            setErrorMessage("Ошибка при попытке регистрации");
        }
    };

    return (
        <Box>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Электронная почта"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Telegram никнейм"
                    value={tg_nickname}
                    onChange={(e) => setTg_nickname(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Повторите пароль"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button variant="contained" fullWidth onClick={RegisterRequest}>
                    Зарегистрироваться
                </Button>
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            </Stack>
        </Box>
    );
};

export default SignUpForm;
