import {SetCookie} from "shared/utils/Cookies";

import {AuthState} from "./AuthState";
import {AuthType}  from "./AuthTypes";


const NO_AUTH_USERNAME_COOKIE = "no_auth_username";

export class NoAuthState implements AuthState {
    private readonly userName: string = "";

    public constructor(username: string) {
        this.userName = username;
        SetCookie(NO_AUTH_USERNAME_COOKIE, username);
    }

    public getType(): AuthType {
        return "no_auth";
    }

    public getId(): string {
        return this.userName;
    }

    public getName(): string {
        return this.userName;
    }

    public logOut(): Promise<object | undefined> {
        SetCookie(NO_AUTH_USERNAME_COOKIE, "");
        return Promise.resolve(undefined);
    }

}
