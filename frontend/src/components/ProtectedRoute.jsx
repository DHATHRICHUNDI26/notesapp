import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            await Promise.resolve();

            const token = localStorage.getItem(ACCESS_TOKEN);

            if (!token) {
                if (!cancelled) {
                    setIsAuthorized(false);
                }
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const now = Date.now() / 1000;

                if (decoded.exp <= now) {
                    const refreshToken = localStorage.getItem(REFRESH_TOKEN);

                    if (!refreshToken) {
                        if (!cancelled) {
                            setIsAuthorized(false);
                        }
                        return;
                    }

                    const res = await api.post("/api/token/refresh/", {
                        refresh: refreshToken,
                    });

                    if (res.status === 200) {
                        localStorage.setItem(ACCESS_TOKEN, res.data.access);

                        if (!cancelled) {
                            setIsAuthorized(true);
                        }
                    } else {
                        if (!cancelled) {
                            setIsAuthorized(false);
                        }
                    }
                } else {
                    if (!cancelled) {
                        setIsAuthorized(true);
                    }
                }
            } catch (error) {
                console.log(error);
                if (!cancelled) {
                    setIsAuthorized(false);
                }
            }
        };

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;