import {getCookie} from "../utils/Cookies";
import {GoogleAuthState} from "../utils/auth/GoogleAuthState";
import {AuthState} from "../utils/auth/AuthState";
import {NoAuthState} from "../utils/auth/NoAuthState";
import ClientConfig = gapi.auth2.ClientConfig;
import {loadDynamicScript} from "../utils/Script";

export const LoginController = (() => {
    const loginPopup = document.getElementById("login-popup");
    const overlay = document.getElementById("overlay");

    const loginHeaderContainer = document.getElementById("header-login-container");
    const loginHeaderButton = document.getElementById("header-signin-button");
    const logoutHeaderButton = document.getElementById("header-signout-button");

    let isOpen = false;
    let disabled = false;

    let authState: AuthState = undefined;

    // Put authentication type meta-tags here (used to determine if an auth method is enabled)
    const noAuthMeta = document.getElementById('no_auth_enable');
    const googleAuthMeta = document.getElementById('google-signin-client_id');

    const setAuthState = function(as: AuthState): void {
        const p = Promise.resolve();
        if (authState !== undefined) {
            console.log("Attempt to load multiple auth states!");
            p.then(authState.LogOut);
        }
        p.then(() => authState = as);
    }

    const toggle = function(): void {
        loginPopup.classList.toggle("invisible");
        overlay.classList.toggle("invisible");
    }

    const onLogin = function(): void {
        loginHeaderContainer.classList.add("hide");
        logoutHeaderButton.classList.remove("hide");
        if (LoginController.IsOpen())
            LoginController.Toggle();
    }

    const onGoogleLogin = function(u: gapi.auth2.GoogleUser): void {
        console.log(u.getBasicProfile().getName());
        setAuthState(new GoogleAuthState());
        onLogin();
    }

    const onNoAuthLogin = function(username: string): void {
        setAuthState(new NoAuthState(username));
        onLogin();
    }

    const onNoAuthSubmitted = function(): void {
        const username = (<HTMLInputElement>document.getElementById("no-auth-user-input")).value;
        console.log("NO AUTH LOGIN: " + username);
        if (username === "") {
            alert("User Name must not be blank");
            return;
        }
        onNoAuthLogin(username);
    }

    const onLogout = function(): void {
        authState = undefined;
        loginHeaderContainer.classList.remove("hide");
        logoutHeaderButton.classList.add("hide");
    }

    const onLoginError = function(e: {error: string}): void {
        console.log(e);
    }

    return {
        Init: function(): Promise<number> {
            isOpen = false;

            loginHeaderButton.onclick = () => {
                LoginController.Toggle();
            };

            logoutHeaderButton.onclick = () => {
                if (authState !== undefined) {
                    authState.LogOut().then(onLogout);
                } else {
                    onLogout();
                }
            };

            overlay.addEventListener("click", () => {
                if (LoginController.IsOpen())
                    LoginController.Toggle();
            });

            // Setup each auth method if they are loaded in the page
            let authPromise = Promise.resolve();
            if (googleAuthMeta !== null) {
                authPromise =
                    authPromise
                        .then(() => loadDynamicScript("https://apis.google.com/js/platform.js"))
                        .then(() => {
                            console.log("0");
                            gapi.signin2.render('login-popup-google-signin', {
                                'scope': 'profile email',
                                'width': 240,
                                'height': 50,
                                'longtitle': true,
                                'onsuccess': onGoogleLogin,
                                'onfailure': onLoginError
                            });

                            return new Promise<void>((resolve) => {
                                gapi.load('auth2', resolve);
                            });
                        })
                        .then(() => {
                            console.log("0");
                            return gapi.auth2.init(new class implements ClientConfig {
                                public client_id?: string = googleAuthMeta.getAttribute('content');
                            });
                        })
                        .then((auth2) => {
                            console.log("0");
                            console.log(auth2.isSignedIn.get());
                            if (auth2.isSignedIn.get()) {
                                onGoogleLogin(auth2.currentUser.get());
                            }
                        });
            }


            if (noAuthMeta !== null) {
                authPromise =
                    authPromise
                        .then(() => {
                            console.log("1");
                            const username = getCookie("no_auth_username");
                            if (username !== "") {
                                onNoAuthLogin(username);
                            }
                            document.getElementById("no-auth-submit").onclick = onNoAuthSubmitted;
                        });
            }

            return authPromise.then(() => 1);
        },
        Toggle: function(): void {
            if (disabled)
                return;

            isOpen = !isOpen;
            toggle();
        },
        IsOpen: function(): boolean {
            return isOpen;
        },
        Enable: function(): void {
            disabled = false;
        },
        Disable: function(): void {
            disabled = true;
        },
        GetAuthHeader(): string {
            if (authState === undefined) {
                return ""
            }
            return authState.GetAuthHeader();
        }
    }

})();
