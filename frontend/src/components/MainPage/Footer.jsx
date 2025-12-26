import React from 'react';
import {
    Box,
    Container,
    Stack,
    Typography
} from "@mui/material";

function Footer() {
    return (
        <Box sx={{ bgcolor: "grey.800", color: "white", py: 4 }}>
            <Container>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                >
                    <Typography variant="body2">© 2025 FindMyTeam</Typography>
                </Stack>
            </Container>
        </Box>
    );
}

export default Footer;

