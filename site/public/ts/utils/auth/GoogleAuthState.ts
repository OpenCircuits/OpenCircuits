import {AuthState} from "./AuthState";

export class GoogleAuthState implements AuthState {

    public getAuthHeader(): string {
        const auth2 = gapi.auth2.getAuthInstance();
        if (!auth2.isSignedIn.get())
            return "";
        return "google " + auth2.currentUser.get().getAuthResponse().id_token;
    }

    public logOut(): Promise<object> {
        return gapi.auth2.getAuthInstance().signOut();
    }

}
