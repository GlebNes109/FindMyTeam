import React from "react";
import ReactDOM from "react-dom";
import styles from "../styles/BaseModal.module.css";

const BaseModal = ({ isOpen, onClose, children}) => {
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

export default BaseModal;
