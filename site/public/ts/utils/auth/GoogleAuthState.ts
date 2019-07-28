import {AuthState} from "./AuthState";

export class GoogleAuthState implements AuthState {
    public GetAuthHeader(): string {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            return "google " + gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
        } else {
            return "";
        }
    }

    public LogOut(): Promise<object> {
        return gapi.auth2.getAuthInstance().signOut();
    }

}
