import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { cyan, teal } from '@mui/material/colors';

const theme = extendTheme({
    colorSchemes: {
        dark: {
            palette: {
                mode: 'dark',
                primary: { main: '#FFDD2D' },
                secondary: { main: '#FFFFFF' },
                background: { default: '#121212', paper: '#1C1B1F' },
                text: { primary: '#FFFFFF', secondary: '#B3B3B3' },
            },
        },
        /*light: {
            palette: {
                mode: 'light',
                primary: {main: '#FFDD2D'},
                secondary: {main: '#f3f3f3'},    // чёрный
                background: {default: '#FFFFFF', paper: '#FFFBFE'}, // белый фон
                text: {primary: '#000000', secondary: '#333333'},
            },
        },*/
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
