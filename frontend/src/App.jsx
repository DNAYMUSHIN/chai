import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import {routes} from "./routes.js";
import {RouterProvider} from "react-router-dom";

export default function App() {
    return (
        <React.Fragment>
            <CssBaseline />
            <RouterProvider router={routes} />
        </React.Fragment>
    );
}