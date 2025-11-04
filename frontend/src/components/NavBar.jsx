import React from 'react';
import {useNavigate} from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button, useTheme, useMediaQuery, Stack, IconButton
} from "@mui/material";

import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar position="fixed">
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}>
                    FindMyTeam
                </Typography>
                {isMobile ? (
                    <Stack direction="row" spacing={1}>
                        <IconButton color="inherit" onClick={() => navigate("/")}><MenuIcon /></IconButton>
                        <IconButton color="inherit" onClick={() => navigate("/events")}><EventIcon /></IconButton>
                        <IconButton color="inherit" onClick={() => navigate("/home")}><HomeFilledIcon /></IconButton>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={2}>
                        <Button color="inherit" onClick={() => navigate("/")}>На главную</Button>
                        <Button color="inherit" onClick={() => navigate("/events")}>Мероприятия</Button>
                        <Button color="inherit" onClick={() => navigate("/home")}>Личный кабинет</Button>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
