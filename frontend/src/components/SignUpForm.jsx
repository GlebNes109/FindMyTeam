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
    // это сделано очень плохо, логика дублируется тут и на бэке. Это необходимо переделать обязательно
    const validateForm = () => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setErrorMessage("Введите корректный адрес электронной почты");
            return false;
        }
        if (login.length < 4 || login.length > 30) {
            setErrorMessage("Логин должен содержать от 4 до 30 символов");
            return false;
        }
        if (password !== confirmPassword) {
            setErrorMessage("Пароли не совпадают");
            return false;
        }
        if (password.length < 8) {
            setErrorMessage("Пароль должен содержать минимум 8 символов");
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setErrorMessage("Пароль должен содержать хотя бы одну заглавную букву");
            return false;
        }
        if (!/[a-z]/.test(password)) {
            setErrorMessage("Пароль должен содержать хотя бы одну строчную букву");
            return false;
        }
        if (!/[0-9]/.test(password)) {
            setErrorMessage("Пароль должен содержать хотя бы одну цифру");
            return false;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrorMessage("Пароль должен содержать хотя бы один спецсимвол");
            return false;
        }

        setErrorMessage("");
        return true;
    };
    // это сделано очень плохо, логика дублируется тут и на бэке. Это необходимо переделать обязательно

    const RegisterRequest = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Пароли отличаются");
            return;
        }

        if (!validateForm()) return;


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
                <Alert severity="warning">Буквы в пароле должны быть только латиницей A-Z. Пароль должен содержать минимум 8 символов, включая заглавную и строчную букву, цифру и специальный символ.</Alert>
            </Stack>
        </Box>
    );
};

export default SignUpForm;
