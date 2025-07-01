import { createTheme } from '@mui/material/styles';
import {blueGrey, cyan, deepPurple, grey, indigo, lightGreen, lime, teal} from '@mui/material/colors';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: teal[300],
        },
        secondary: {
            main: cyan[500],
        },
    },
    typography: {
        fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    },
});

export default theme;
