import {AuthType} from "./AuthTypes";


export interface AuthState {
    // Gets auth type
    getType(): AuthType;
    // Gets auth identification
    getId(): string;
    // Get user-name
    getName(): string;
    // Logs the user out of their session and invalidates this object
    logOut(): Promise<object | undefined>;
}
