import {jwtDecode} from "jwt-decode";

import {AuthState} from "./AuthState";
import {AuthType}  from "./AuthTypes";
import {SetCookie} from "shared/site/utils/Cookies";


const GOOGLE_AUTH_CREDENTIAL_COOKIE = "google_auth_credential";

export class GoogleAuthState implements AuthState {
    private readonly id: string;
    private readonly name: string;

    // Credential is a JWT
    public constructor(credential: string) {
        this.id = credential;

        const decoded = jwtDecode(credential);
        this.name = "name" in decoded ? (decoded.name as string ?? "") : "";

        SetCookie(GOOGLE_AUTH_CREDENTIAL_COOKIE, credential);
    }

    public getType(): AuthType {
        return "google";
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public logOut(): void {
        SetCookie(GOOGLE_AUTH_CREDENTIAL_COOKIE, "");
    }
}
