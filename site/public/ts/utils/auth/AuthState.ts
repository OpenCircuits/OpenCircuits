
export interface AuthState {
    // Gets an authorization header for outgoing requests
    GetAuthHeader(): string;
    // Logs the user out of their session and invalidates this object
    LogOut(): Promise<any>;
}