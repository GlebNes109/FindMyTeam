import Navbar from "../components/NavBar.jsx";
import styles from "../styles/MainPage.module.css";
import React from "react";
import { useNavigate } from "react-router-dom";


function MainPage() {
    const navigate = useNavigate();
    return (
        <div className={styles['main-content']}>
        <div className={styles['text-content']}>
            <h1>Добро пожаловать в FindMyTeam</h1>
            <p>Здесь можно найти команду для олимпиад и проектов.</p>
            <div>
                <button className={styles['btn-login-register']}
                onClick={() => navigate("/login")}>Войти
            </button>
            </div>
            <div><button className={styles['btn-login-register']}
                         onClick={() => navigate("/signup")}>Зарегистрироваться</button></div>
        </div>
        </div>
    );
}

export default MainPage;