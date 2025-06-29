import {AuthState} from "./AuthState";
import {AuthType}  from "./AuthTypes";


export class GoogleAuthState implements AuthState {

    public getType(): AuthType {
        return "google";
    }

    public getId(): string {
        const auth2 = gapi.auth2.getAuthInstance();
        if (!auth2.isSignedIn.get())
            return "";
        return auth2.currentUser.get().getAuthResponse().id_token;
    }

    public getName(): string {
        const auth2 = gapi.auth2.getAuthInstance();
        if (!auth2.isSignedIn.get())
            return "";
        return auth2.currentUser.get().getBasicProfile().getName();
    }

    public logOut(): Promise<object> {
        return gapi.auth2.getAuthInstance().signOut();
    }

}
