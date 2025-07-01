import React, {useState} from "react";
import styles from "../styles/LoginRegisterPage.module.css";
import {useNavigate} from "react-router-dom";
import {Alert, Box, Button, Container, Stack, TextField, Typography} from "@mui/material"; // Подключаем стили

const LoginPage = () => {
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    function LoginRequest() {
        fetch('http://localhost:8080/users/signin', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                login: login,
                password: password
            })
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 404) {
                        // console.log("неверный логин пароль))");
                        setErrorMessage("неверный логин или пароль");
                    }
                    else if (response.status === 400) {
                        setErrorMessage("некорректные значения или поля не заполнены");
                    }
                    else {
                        setErrorMessage("HTTP код ошибки: " + response.status);
                    }
                    return Promise.reject();
                }
                return response.json();
            })
            .then((data) => {
                localStorage.setItem("token", data.token);
                navigate('/events');
                // console.log("Токен в логине:", data.token);
            })
            .catch(error => console.error('Ошибка loginPage:', error));
    }

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
