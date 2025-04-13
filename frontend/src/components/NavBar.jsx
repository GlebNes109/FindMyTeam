import React from 'react';
import styles from '../styles/NavBar.module.css';
import {useNavigate} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg position-fixed w-100 fixed-top" style={{ backgroundColor: '#343a40', color: "white"}}>
            <div className="container-fluid">
                <a className="navbar-brand" href="#">FindMyTeam</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Переключить навигацию">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <button className="btn btn-link nav-link" onClick={() => navigate('/')}>На главную</button>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-link nav-link" onClick={() => navigate('/events')}>Мероприятия</button>
                        </li>
                        <li className="nav-item">
                            <button className="btn btn-link nav-link" onClick={() => navigate('/home')}>Личный кабинет</button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    );
}

export default Navbar;
