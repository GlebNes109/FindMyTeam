import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { useState } from "react";

const SelectVacancyModal = ({ isOpen, onClose, vacancies, onSubmit, participant }) => {
    const [selectedVacancyId, setSelectedVacancyId] = useState("");

    const handleInvite = () => {
        if (selectedVacancyId) {
            onSubmit(selectedVacancyId);
            onClose();
            setSelectedVacancyId("");
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Пригласить {participant?.login}</DialogTitle>

            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Выберите вакансию</InputLabel>
                    <Select
                        value={selectedVacancyId}
                        label="Выберите вакансию"
                        onChange={(e) => setSelectedVacancyId(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>—</em>
                        </MenuItem>
                        {vacancies.map((v) => (
                            <MenuItem key={v.id} value={v.id}>
                                {v.track.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Отмена
                </Button>
                <Button onClick={handleInvite} disabled={!selectedVacancyId} variant="contained">
                    Отправить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SelectVacancyModal;
