import {setCookie} from "../Cookies";
import {AuthState} from "./AuthState";

export class NoAuthState implements AuthState {
    private readonly userName: string = "";

    public constructor(username: string) {
        this.userName = username;
        setCookie("no_auth_username", username);
    }

    public GetAuthHeader(): string {
        return "no_auth " + this.userName;
    }

    public LogOut(): Promise<object> {
        setCookie("no_auth_username", "");
        return Promise.resolve(null);
    }

}
