import React from 'react';
import styles from '../styles/NavBar.module.css';
import {useNavigate} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className={styles.navbar}>
            <h1>FindMyTeam</h1>
            <div className={styles['navbar-buttons']}>
            <button className={styles['navbar-btn']} onClick={() => navigate('/')}>Личный r</button>
            <button className={styles['navbar-btn']} onClick={() => navigate('/events')}>Мероприятия</button>
            <button className={styles['navbar-btn']} onClick={() => navigate('/homepage')}>Личный кабинет</button>
        </div>
        </nav>
    );
}

export default Navbar;
