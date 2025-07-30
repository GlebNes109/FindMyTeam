import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';
import {handleAuthFailure} from "./authHandler.js";

export async function refreshAccessToken() {
    const res = await fetch("/api/users/auth/refresh", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) throw { code: "UNABLE_TO_UPDATE_TOKEN", message: "Не удалось обновить токен" };

    const data = await res.json();
    setAccessToken(data.access_token);
    return data.access_token;
}

export async function apiFetch(url, options = {}, retry = true) {
    const token = getAccessToken();

    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
    };

    const response = await fetch(`/api${url}`, {
        ...options,
        method: options.method || 'GET',
        headers,
        credentials: "include",
    });

    if (response.status === 401 && retry) {
        try {
            const newToken = await refreshAccessToken();
            return apiFetch(url, options, false);
        } catch (err) {
            clearAccessToken();

            if (typeof handleAuthFailure === "function") {
                handleAuthFailure(err);
            }

            throw err;
        }
    }

    return response;
}
