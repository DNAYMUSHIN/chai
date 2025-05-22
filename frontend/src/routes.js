import {LOGIN_ROUTE, CRM_ROUTE} from "./utils/consts";
import CRM from "./pages/CRM";
import Login from "./pages/Login.jsx";
/*import {createBrowserRouter} from "react-router-dom";

export const authRoutes = createBrowserRouter([
    {
        path: CRM_ROUTE,
        Component: CRM
    },
    {
        path: LOGIN_ROUTE,
        Component: Login
    },
])*/

export const authRoutes = [
    {
        path: CRM_ROUTE,
        Component: CRM
    },
]

export const publicRoutes = [
    {
        path: LOGIN_ROUTE,
        Component: Login
    },
]