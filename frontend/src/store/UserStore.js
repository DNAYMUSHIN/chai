import {makeAutoObservable, reaction, runInAction} from "mobx";

export default class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        makeAutoObservable(this);
        this.loadFromStorage();

        reaction(
            () => this._isAuth,
            (isAuth) => console.log('isAuth changed to:', isAuth)
        );
    }



    setIsAuth(isAuth) {
        //this._isAuth = isAuth;
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

    loadFromStorage() {
        try {
            const isAuth = JSON.parse(localStorage.getItem("isAuth") || "false");
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            this._isAuth = isAuth;
            this._user = user;
        } catch (e) {
            console.error("Failed to parse stored data", e);
            // Сбрасываем на дефолтные значения при ошибке
            this._isAuth = false;
            this._user = {};
            // Очищаем битые данные
            localStorage.removeItem("isAuth");
            localStorage.removeItem("user");
        }
    }

    logout() {
        this._isAuth = false;
        this._user = {};
        localStorage.removeItem("isAuth");
        localStorage.removeItem("user");
    }

    get isAuth() {
        return this._isAuth;
    }

    get user() {
        return this._user;
    }
}