import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    useTheme,
    useMediaQuery,
    Stack,
    IconButton,
    Drawer,
    Box,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import MenuIcon from '@mui/icons-material/Menu';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const colorScheme = useColorScheme();
    const mode = colorScheme?.mode;
    const setMode = colorScheme?.setMode;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => setAnchorEl(null);

    const handleModeChange = (value, closeFn) => {
        console.log('handleModeChange called with:', value, { mode, setMode, colorScheme });
        if (typeof setMode === 'function') {
            try {
                console.log('Calling setMode with:', value);
                setMode(value);
                console.log('setMode called successfully');
            } catch (error) {
                console.error('Error setting theme mode:', error);
            }
        } else {
            console.warn('setMode is not a function', { setMode, type: typeof setMode, colorScheme });
        }
        closeFn?.();
    };


    const mobileNav = (
        <>
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 250, p: 2, display: "flex", flexDirection: "column", gap: 2 , mt: 2}}>
                    <Stack spacing={1}>
                        <Button variant="text" onClick={() => { navigate("/"); setDrawerOpen(false); }}>На главную</Button>
                        <Button variant="text" onClick={() => { navigate("/events"); setDrawerOpen(false); }}>Мероприятия</Button>
                        <Button variant="text" onClick={() => { navigate("/home"); setDrawerOpen(false); }}>Личный кабинет</Button>
                    </Stack>
                </Box>
            </Drawer>
        </>
    );

    const desktopMenu = (
        <>
            <Button color="inherit" onClick={() => navigate("/")}>На главную</Button>
            <Button color="inherit" onClick={() => navigate("/events")}>Мероприятия</Button>
            <Button color="inherit" onClick={() => navigate("/home")}>Личный кабинет</Button>
        </>
    );

    return (
        <AppBar position="fixed" elevation={1} sx={{
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
  }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                    variant="h6"
                    sx={{ fontSize: isMobile ? '1rem' : '1.25rem', cursor: 'pointer' }}
                    onClick={() => navigate("/")}
                >
                    FindMyTeam
                </Typography>
                {isMobile ? (
                    mobileNav
                ) : (
                    <Stack direction="row" spacing={2} alignItems="center">
                        {desktopMenu}
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
