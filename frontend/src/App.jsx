import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from "./components/NavBar.jsx";

function App() {
    return (
        <div>
            <Navbar />
            <h1>Добро пожаловать в FindMyTeam</h1>
            <p>Здесь можно найти команду для олимпиад и проектов.</p>
        </div>
    );
}
export default App
