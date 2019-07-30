import {SetCookie} from "../Cookies";
import {AuthState} from "./AuthState";

export class NoAuthState implements AuthState {
    private readonly userName: string = "";

    public constructor(username: string) {
        this.userName = username;
        SetCookie("no_auth_username", username);
    }

    public getAuthHeader(): string {
        return "no_auth " + this.userName;
    }

    public logOut(): Promise<object> {
        SetCookie("no_auth_username", "");
        return Promise.resolve(null);
    }

}
