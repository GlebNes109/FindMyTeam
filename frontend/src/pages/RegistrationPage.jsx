import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Alert,
    Stack
} from "@mui/material";

const RegistrationPage = () => {
    const [email, setEmail] = useState("");
    const [tg_nickname, setTg_nickname] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");

    function RegisterRequest() {
        if (password !== confirmPassword) {
            console.log("Passwords don't match");
            return;
        }

        fetch('http://localhost:8080/users/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                login: login,
                password: password,
                email: email,
                tg_nickname: tg_nickname,
            })
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        setErrorMessage("Не все поля заполнены или некорректные значения");
                    }
                    if (response.status === 409) {
                        setErrorMessage("Такой логин уже есть, возьмите другой");
                    }
                    return Promise.reject();
                }
                return response.json();
            })
            .then((data) => {
                // console.log("Токен:", data.token);
                localStorage.setItem("token", data.token);
                navigate('/events');})
            .catch(error => console.error('Ошибка:', error));
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h4" gutterBottom>
                    Регистрация
                </Typography>

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

                    <Button
                        variant="text"
                        onClick={() => navigate("/signin")}
                        sx={{ textTransform: "none" }}
                    >
                        Уже есть аккаунт?
                    </Button>

                    {errorMessage && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}
                </Stack>
            </Box>
        </Container>
    );
};

export default RegistrationPage;