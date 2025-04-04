import React from "react";
import ReactDOM from "react-dom";
import styles from "../styles/RegEventModal.module.css";

const RegistrationEventModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                {children}
            </div>
        </div>,
        document.getElementById("modal-root")
    );
};

export default RegistrationEventModal;
