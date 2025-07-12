import {getAuth, signOut} from "firebase/auth";

import {AuthState} from "./AuthState";
import {AuthType}  from "./AuthTypes";


const GOOGLE_AUTH_CREDENTIAL_COOKIE = "google_auth_credential";

export class GoogleAuthState implements AuthState {
    private readonly id: string;
    private readonly name: string;

    // Credential is a JWT
    public constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
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
        signOut(getAuth());
    }
}
