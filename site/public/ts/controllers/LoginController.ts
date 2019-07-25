import {getCookie} from "../utils/Cookies";
import {GoogleAuthState} from "../utils/auth/GoogleAuthState";
import {AuthState} from "../utils/auth/AuthState";
import {NoAuthState} from "../utils/auth/NoAuthState";

export const LoginController = (() => {
    const loginPopup = document.getElementById("login-popup");
    const overlay = document.getElementById("overlay");

    const loginHeaderContainer = document.getElementById("header-login-container");
    const loginHeaderButton = document.getElementById("header-signin-button");
    const logoutHeaderButton = document.getElementById("header-signout-button");

    let isOpen = false;
    let disabled = false;

    let authState: AuthState = undefined;

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

    const onLogout = function(): void {
        authState = undefined;
        loginHeaderContainer.classList.remove("hide");
        logoutHeaderButton.classList.add("hide");
    }

    const onLoginError = function(e: {error: string}): void {
        console.log(e);
    }

    const setAuthState = function(as: AuthState): void {
        let p = Promise.resolve();
        if (authState !== undefined) {
            console.log("Attempt to load multiple auth states!");
            p.then(authState.LogOut);
        }
        p.then(() => authState = as);
    }

    return {
        Init: function(resolve: (value?: unknown) => void): void {
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

            (<any>window).onGapiLoad = () => {
                gapi.signin2.render('login-popup-google-signin', {
                    'scope': 'profile email',
                    'width': 240,
                    'height': 50,
                    'longtitle': true,
                    'onsuccess': onGoogleLogin,
                    'onfailure': onLoginError
                });

                gapi.load('auth2', () => {
                    const clientId = document.getElementsByName('google-signin-client_id')[0].getAttribute('content');
                    gapi.auth2.init({
                        client_id: clientId
                    }).then((auth2) => {
                        console.log(auth2.isSignedIn.get());
                        if (auth2.isSignedIn.get()) {
                            onGoogleLogin(auth2.currentUser.get());
                        }
                        resolve(1);
                    });
                });
            };

            if (document.getElementById('no_auth_enabled') !== undefined) {
                let username = getCookie("no_auth_username");
                if (username !== "") {
                    onNoAuthLogin(username);
                }
            }

            (<any>window).onNoAuthSubmitted = (username: string) => {
                if (username === "") {
                    alert("User Name must not be blank");
                    return;
                }
                onNoAuthLogin(username);
            };

            (<any>window).authPing = () => {
                let xhr = new XMLHttpRequest();
                xhr.open("POST", "ping", false);
                xhr.setRequestHeader("auth", authState !== undefined ? authState.GetAuthHeader() : "");
                xhr.onreadystatechange = () => {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            console.log("SUCCESSFUL PING");
                        } else {
                            console.log("UNSUCCESSFUL PING " + this.status);
                        }
                    }
                };
                xhr.send();
            }
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
