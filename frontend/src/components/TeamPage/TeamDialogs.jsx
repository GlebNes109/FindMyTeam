import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from "@mui/material";

function TeamDialogs({ 
    openLeaveDialog, 
    setOpenLeaveDialog, 
    openDeleteDialog, 
    setOpenDeleteDialog,
    confirmRemoveVacancy,
    setConfirmRemoveVacancy,
    confirmKickMember,
    setConfirmKickMember,
    onLeaveTeam,
    onDeleteTeam,
    onRemoveVacancy,
    onKickMember
}) {
    return (
        <>
            <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
                <DialogTitle>Подтверждение</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы действительно хотите выйти из команды?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenLeaveDialog(false)}>Отменить</Button>
                    <Button color="error" onClick={onLeaveTeam}>Выйти</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Удаление команды</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Это действие нельзя отменить. Вы уверены, что хотите удалить команду?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Отменить</Button>
                    <Button color="error" onClick={onDeleteTeam}>Удалить</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmRemoveVacancy.open}
                onClose={() => setConfirmRemoveVacancy({ open: false, index: null, id: null })}
            >
                <DialogTitle>Удалить вакансию?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Это действие нельзя отменить. Удалить эту вакансию?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmRemoveVacancy({ open: false, index: null, id: null })}>
                        Отмена
                    </Button>
                    <Button
                        color="error"
                        onClick={onRemoveVacancy}
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmKickMember.open}
                onClose={() => setConfirmKickMember({ open: false, id: null })}
            >
                <DialogTitle>Исключить участника?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Участник будет удалён из команды. Продолжить?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmKickMember({ open: false, id: null })}>
                        Отмена
                    </Button>
                    <Button
                        color="error"
                        onClick={onKickMember}
                    >
                        Исключить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default TeamDialogs;

