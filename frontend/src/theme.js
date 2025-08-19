import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { cyan, teal } from '@mui/material/colors';

const theme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                mode: 'dark',
                primary: { main: teal[300] },
                secondary: { main: cyan[500] },
                background: { default: '#1C1B1F', paper: '#1C1B1F' }, // M3 dark background
            },
        },
        light: {
            palette: {
                mode: 'light',
                primary: { main: teal[700] },
                secondary: { main: cyan[600] },
                background: { default: '#FFFBFE', paper: '#FFFBFE' }, // M3 light background
            },
        },
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
});

export default theme;
