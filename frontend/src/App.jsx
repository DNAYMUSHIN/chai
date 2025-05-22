import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter.jsx";

export default function App() {
    return (
        <BrowserRouter>
            <CssBaseline />
            <AppRouter />
        </BrowserRouter>
    );
}