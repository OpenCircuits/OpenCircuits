
export interface AuthState {
    // Gets an authorization header for outgoing requests
    getAuthHeader(): string;
    // Logs the user out of their session and invalidates this object
    logOut(): Promise<object>;
}
