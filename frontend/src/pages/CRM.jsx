import React, {useContext, useState} from 'react';
import { Context } from "../main.jsx";
import { Button, Link, Box } from "@mui/material";
import { LOGIN_ROUTE } from "../utils/consts.js";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

import "./CRM.css";
import Orders from "../components/Orders.jsx";
import Products from "../components/Products.jsx";
import Categories from "../components/Categories.jsx";

const CRM = observer(() => {
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const [activeComponent, setActiveComponent] = useState(null);

    const handleButtonClick = (componentName) => {
        setActiveComponent(componentName);
    };

    // Рендеринг компонента по выбору
    const renderComponent = () => {
        switch (activeComponent) {
            case 'Orders':
                return <Orders />;
            case 'Products':
                return <Products />;
            case 'Categories':
                return <Categories />;
            default:
                return <Orders />;
        }
    };

    return (
        <div className="crm">
            <div className="crm__aside">
                <div className="crm__aside-main">
                    <div className="crm__logo">
                        Лавка
                    </div>
                    <nav className="crm__nav">
                        <ul className="crm__nav-list">
                            <li className="crm__nav-item">
                                <Button onClick={() => handleButtonClick("Orders")} variant="text">Заказы</Button>
                            </li>
                            <li className="crm__nav-item">
                                <Button onClick={() => handleButtonClick("Products")} variant="text">Товары</Button>
                            </li>
                            <li className="crm__nav-item">
                                <Button onClick={() => handleButtonClick("Categories")}  variant="text">Категории</Button>
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="crm__aside-logout">
                    <Button
                        onClick={() => {
                        user.setIsAuth(false);
                        navigate(LOGIN_ROUTE);
                    }}>
                        LOG OUT
                    </Button>
                </div>
            </div>
            <div className="crm__main">
                {renderComponent()}
            </div>
        </div>
    );
});

export default CRM;