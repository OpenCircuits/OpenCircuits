import {AuthState} from "./AuthState";

export class GoogleAuthState implements AuthState {
    GetAuthHeader(): string {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            return "google " + gapi.auth2.getAuthInstance().currentUser.get().getId();
        } else {
            return "";
        }
    }

    LogOut(): Promise<any> {
        return gapi.auth2.getAuthInstance().signOut();
    }

}