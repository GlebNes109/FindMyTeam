import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from "@mui/material";
import { apiFetch } from "../apiClient.js";

const PatchUserModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        login: "",
        password: "",
        email: "",
        tg_nickname: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = () => {
        const filteredData = Object.fromEntries(
            Object.entries(formData).filter(([_, value]) => value.trim() !== "")
        );

        if (Object.keys(filteredData).length === 0) {
            console.warn("Нет изменений для отправки");
            return;
        }

        // console.log(formData);
        apiFetch("/users", {
            method: "PATCH",
            body: JSON.stringify(filteredData)
        })
            .then(res => res.json())
            .then((data) => {
                //console.log("Данные обновлены", data);
                onClose();
            })
            .catch(error => console.error("Ошибка обновления:", error));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Изменить данные</DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Новый логин"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    type="password"
                    label="Новый пароль"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    type="email"
                    label="Новый email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Новый telegram никнейм"
                    name="tg_nickname"
                    value={formData.tg_nickname}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Отмена
                </Button>
                <Button onClick={handleUpdate} variant="contained" color="primary">
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PatchUserModal;
