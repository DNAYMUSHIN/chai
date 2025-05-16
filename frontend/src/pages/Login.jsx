import React, { useState } from 'react';
import {
    Input,
    FormControl,
    InputLabel,
    Button, Box
} from "@mui/material";

const Login = () => {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    async function submitLogin(e) {
        e.preventDefault();
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Успешный ответ:", data);
        } catch (error) {
            console.error("Ошибка при авторизации:", error);
        }

    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
        >
            <form
                onSubmit={submitLogin}  // onSubmit перемещен сюда
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
                        autoFocus="true"
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
                        aria-describedby="my-helper-text"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>
                <Button variant="contained" color="info" type="submit">  {/* Добавлен type="submit" */}
                    Войти
                </Button>
            </form>
        </Box>
    );
};

export default Login;