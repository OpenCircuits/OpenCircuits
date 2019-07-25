import {setCookie} from "../Cookies";
import {AuthState} from "./AuthState";

export class NoAuthState implements AuthState {
    private readonly userName: String = "";

    constructor(username: string) {
        this.userName = username;
        setCookie("no_auth_username", username);
    }

    GetAuthHeader(): string {
        return "no_auth " + this.userName;
    }

    LogOut(): Promise<any> {
        return Promise.resolve();
    }

}