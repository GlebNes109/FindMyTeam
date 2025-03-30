import React from 'react';
import styles from '../styles/NavBar.module.css';
import {useNavigate} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className={styles.navbar}>
            <h1>FindMyTeam</h1>
            <button className={styles['navbar-btn']} onClick={() => navigate('/homepage')}>Личный кабинет</button>
        </nav>
    );
}

export default Navbar;
