import React from 'react';
import styles from './NavBar.module.css';

function Navbar() {
    return (
        <nav className={styles.navbar}>
            <h1>FindMyTeam</h1>
            <button className={styles.navbarBtn}>Поддержка</button>
        </nav>
    );
}

export default Navbar;
