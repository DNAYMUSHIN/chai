import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    Input,
    FormControl,
    InputLabel,
    Button, Box, Alert
} from "@mui/material";
import { Context } from "../main.jsx";
import { useNavigate } from "react-router-dom";
import { CRM_ROUTE } from "../utils/consts.js";

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const { user } = useContext(Context);
    const navigate = useNavigate();
    const [authStatus, setAuthStatus] = useState(null);
    const [authMessage, setAuthMessage] = useState('');
    const timeoutRef = useRef(null);

    // Очищаем таймер при размонтировании
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const showAlert = (status, message) => {
        // Сбрасываем предыдущий таймер
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setAuthStatus(status);
        setAuthMessage(message);

        // Устанавливаем таймер на 10 секунд только для ошибок
        if (status === 'error') {
            timeoutRef.current = setTimeout(() => {
                setAuthStatus(null);
            }, 3000);
        }
    };

    async function submitLogin(e) {
        e.preventDefault();

        try {
            const response = await fetchAuth(login, password);

            if (!response) { // Проверка на undefined
                showAlert('error', 'Не удалось получить ответ от сервера');
                return;
            }

            if (response.success) {
                showAlert('success', 'Вы успешно авторизовались!');
                user.setIsAuth(true);
                navigate(CRM_ROUTE, { replace: true });
            } else {
                showAlert('error', response.message || 'Ошибка авторизации');
                user.setIsAuth(false);
            }
        } catch (error) {
            showAlert('error', 'Произошла ошибка при подключении к серверу');
            console.error('Auth error:', error);
        }
    }

    const fetchAuth = async (login, password) => {
        try {
            const response = await fetch("/api/loginAd", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    admin_email: login,
                    password: password,
                })
            });


            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // На случай, если сервер не вернёт JSON
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: response.status === 201, message: data.message };
        } catch (error) {
            console.error("FetchAuth error:", error);
            return { success: false, message: error.message || "Ошибка подключения к серверу" };
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            pos="relative"
        >
            <form
                onSubmit={submitLogin}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px"
                }}
            >
                <h1>Авторизация</h1>
                <FormControl>
                    <InputLabel htmlFor="login">Логин</InputLabel>
                    <Input
                        autoFocus
                        id="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="password">Пароль</InputLabel>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>
                <Button variant="contained" color="info" type="submit">
                    Войти
                </Button>
            </form>
            {authStatus && (
                <Alert
                    style={{
                        position: "fixed",
                        bottom: "5vh",
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}
                    severity={authStatus}
                    onClose={() => {
                        setAuthStatus(null);
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }
                    }}
                >
                    {authMessage}
                </Alert>
            )}
        </Box>
    );
};

export default Login;