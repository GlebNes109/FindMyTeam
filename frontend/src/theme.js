import { extendTheme as extendTheme } from '@mui/material/styles';

const theme = extendTheme({
    colorSchemes: {
        /* light: {
            palette: {
                mode: 'light',
                primary: { main: '#FFDD2D' },
                secondary: { main: '#1f1f1f' },
                background: { default: '#f7f7f7', paper: '#ffffff' },
                text: { primary: '#1a1a1a', secondary: '#4a4a4a' },
            },
        },*/
        dark: { palette: { mode: 'dark', primary: { main: '#FFDD2D' }, secondary: { main: '#FFFFFF' }, background: { default: '#121212', paper: '#1C1B1F' }, text: { primary: '#FFFFFF', secondary: '#B3B3B3' }, }, },

    },
    typography: {
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiAppBar: {
            defaultProps: { color: 'default' },
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                }),
            },
        },
    },
});

export default theme;
