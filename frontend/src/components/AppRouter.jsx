import React, {Component, useContext, useEffect, useState} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {authRoutes, publicRoutes} from "../routes";
import {CRM_ROUTE, LOGIN_ROUTE} from "../utils/consts";
import {Context} from "../main.jsx";
import {observer} from "mobx-react-lite";

const AppRouter = observer(() => {
    const {user} = useContext(Context);


    return (
        <Routes>
            {user.isAuth &&
                authRoutes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} exact />
                ))}
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} exact />
            ))}
            <Route
                path="*"
                element={
                    user.isAuth ? (
                        <Navigate to={CRM_ROUTE} replace />
                    ) : (
                        <Navigate to={LOGIN_ROUTE} replace />
                    )
                }
            />
        </Routes>
    );
});

export default AppRouter;