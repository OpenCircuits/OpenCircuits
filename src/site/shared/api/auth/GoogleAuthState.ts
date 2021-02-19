import {AuthType} from "./AuthTypes";
import {AuthState} from "./AuthState";

export class GoogleAuthState implements AuthState {

    public getType(): AuthType {
        return "google";
    }

    public getId(): string {
        const auth2 = (window as any).gapi.auth2.getAuthInstance();
        if (!auth2.isSignedIn.get())
            return "";
        return auth2.currentUser.get().getAuthResponse().id_token;
    }

    public logOut(): Promise<object> {
        return (window as any).gapi.auth2.getAuthInstance().signOut();
    }

}
