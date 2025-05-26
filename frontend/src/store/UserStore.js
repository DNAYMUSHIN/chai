import {makeAutoObservable, reaction, runInAction} from "mobx";

export default class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        this._adminId = null;
        makeAutoObservable(this);
        this.loadFromStorage();

        reaction(
            () => this._isAuth,
            (isAuth) => console.log('isAuth changed to:', isAuth)
        );
    }

    setIsAuth(isAuth) {
        runInAction(() => {
            this._isAuth = isAuth;
        });

        if (isAuth) {
            localStorage.setItem("isAuth", JSON.stringify(isAuth));
        } else {
            localStorage.removeItem("isAuth");
        }
    }

    setUser(user) {
        this._user = user;
        localStorage.setItem("user", JSON.stringify(user));
    }

    setAdminId(adminId) {
        this._adminId = adminId;
        if (adminId) {
            localStorage.setItem("admin_id", adminId);
        } else {
            localStorage.removeItem("admin_id");
        }
    }

    loadFromStorage() {
        try {
            const isAuth = JSON.parse(localStorage.getItem("isAuth") || "false");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const adminId = localStorage.getItem("admin_id") || null;

            this._isAuth = isAuth;
            this._user = user;
            this._adminId = adminId;
        } catch (e) {
            console.error("Failed to parse stored data", e);
            // Сбрасываем на дефолтные значения при ошибке
            this._isAuth = false;
            this._user = {};
            this._adminId = null;
            // Очищаем битые данные
            localStorage.removeItem("isAuth");
            localStorage.removeItem("user");
            localStorage.removeItem("admin_id");
        }
    }

    logout() {
        this._isAuth = false;
        this._user = {};
        this._adminId = null;
        localStorage.removeItem("isAuth");
        localStorage.removeItem("user");
        localStorage.removeItem("admin_id");
    }

    get isAuth() {
        return this._isAuth;
    }

    get user() {
        return this._user;
    }

    get adminId() {
        return this._adminId;
    }
}