import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";
import {useNavigate} from "react-router-dom";
import {Alert, Box, Button, Container, Stack, TextField, Typography} from "@mui/material";
import {apiFetch} from "../apiClient.js";
import {setAccessToken} from "../tokenStore.js"; // Подключаем стили

const LoginPage = () => {
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    const LoginRequest = async () => {
        try {
            const response = await apiFetch("/users/signin", {
                method: "POST",
                body: JSON.stringify({
                    login,
                    password,
                }),
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
            navigate("/events");
        } catch {
            // console.error("Ошибка на странице входа:", error);
            setErrorMessage("Ошибка при попытке входа");
        }
    };


    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h4" gutterBottom>
                    Вход в аккаунт
                </Typography>

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

                    <Button variant="contained" fullWidth onClick={LoginRequest}>
                        Войти
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => navigate("/signup")}
                        sx={{ textTransform: "none" }}
                    >
                        Еще нет аккаунта?
                    </Button>

                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}
                </Stack>
            </Box>
        </Container>
    );
};

export default LoginPage;
