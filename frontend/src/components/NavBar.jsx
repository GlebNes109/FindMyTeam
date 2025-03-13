import React from 'react';
import styles from '../styles/NavBar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <h1>FindMyTeam</h1>
            <button className={styles['navbar-btn-support']}>Поддержка</button>
        </nav>
    );
}

export default Navbar;
