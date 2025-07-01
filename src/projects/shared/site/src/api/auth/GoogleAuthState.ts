import {googleLogout} from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

import {AuthState} from "./AuthState";
import {AuthType}  from "./AuthTypes";


export class GoogleAuthState implements AuthState {
    private readonly id: string;
    private readonly name: string;

    // Credential is a JWT
    public constructor(credential: string) {
        this.id = credential;

        const decoded = jwtDecode(credential);
        this.name = "name" in decoded ? (decoded.name as string ?? "") : "";
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

    public async logOut(): Promise<object> {
        googleLogout();
        return {};
    }

}
