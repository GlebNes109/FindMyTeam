import React, { useState } from "react";
import BaseModal from "./BaseModal.jsx";
import styles_modal from "../styles/PatchUserModal.module.css";

const SelectVacancyModal = ({ isOpen, onClose, vacancies, onSubmit, participant }) => {
    const [selectedVacancyId, setSelectedVacancyId] = useState("");

    const handleInvite = () => {
        if (selectedVacancyId) {
            onSubmit(selectedVacancyId);
            onClose();
        }
    };

    return (
        <BaseModal isOpen={isOpen} onClose={onClose}>
            <h4>Пригласить {participant?.login}</h4>
            <p>Выберите вакансию:</p>
            <select
                className={`form-select mb-3 ${styles_modal['input-dark']}`}
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
            >
                <option value="">-- Выберите вакансию --</option>
                {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.track.name}
                    </option>
                ))}
            </select>
            <button className="btn btn-success" onClick={handleInvite} disabled={!selectedVacancyId}>
                Отправить приглашение
            </button>
        </BaseModal>
    );
};

export default SelectVacancyModal;
