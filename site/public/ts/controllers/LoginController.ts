import ClientConfig = gapi.auth2.ClientConfig;

import {GetCookie} from "../utils/Cookies";
import {LoadDynamicScript} from "../utils/Script";

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

    // Put authentication type meta-tags here (used to determine if an auth method is enabled)
    const noAuthMeta = document.getElementById('no_auth_enable');
    const googleAuthMeta = document.getElementById('google-signin-client_id');

    const onLogin = function(): void {
        loginHeaderContainer.classList.add("hide");
        logoutHeaderButton.classList.remove("hide");
        if (LoginController.IsOpen())
            LoginController.Toggle();
    }

    const onLogout = function(): void {
        authState = undefined;
        loginHeaderContainer.classList.remove("hide");
        logoutHeaderButton.classList.add("hide");
    }

    const onLoginError = function(e: {error: string}): void {
        console.error(e);
    }

    const setAuthState = async function(as: AuthState): Promise<void> {
        if (!authState) {
            authState = as;
            return;
        }
        console.error("Attempt to load multiple auth states!");
        await authState.logOut().then(() => authState = as);
    }

    const onGoogleLogin = async function(_: gapi.auth2.GoogleUser): Promise<void> {
        await setAuthState(new GoogleAuthState());
        onLogin();
    }

    const onNoAuthLogin = function(username: string): void {
        setAuthState(new NoAuthState(username));
        onLogin();
    }

    const onNoAuthSubmitted = function(): void {
        const username = (<HTMLInputElement>document.getElementById("no-auth-user-input")).value;
        if (username === "") {
            alert("User Name must not be blank");
            return;
        }
        onNoAuthLogin(username);
    }

    const toggle = function(): void {
        loginPopup.classList.toggle("invisible");
        overlay.classList.toggle("invisible");
    }

    return {
        Init: async function(): Promise<number> {
            isOpen = false;

            loginHeaderButton.onclick = () => {
                LoginController.Toggle();
            };

            logoutHeaderButton.onclick = async () => {
                if (authState)
                    await authState.logOut();
                onLogout();
            };

            overlay.addEventListener("click", () => {
                if (LoginController.IsOpen())
                    LoginController.Toggle();
            });

            // Setup each auth method if they are loaded in the page
            if (googleAuthMeta) {
                // Load GAPI script
                await LoadDynamicScript("https://apis.google.com/js/platform.js");

                // Render sign in button
                gapi.signin2.render('login-popup-google-signin', {
                    'scope': 'profile email',
                    'width': 240,
                    'height': 50,
                    'longtitle': true,
                    'onsuccess': onGoogleLogin,
                    'onfailure': onLoginError
                });

                // Load 'auth2' from GAPI and then initialize w/ meta-data
                await new Promise<void>((resolve) => gapi.load('auth2', resolve));
                await gapi.auth2.init(new class implements ClientConfig {
                    // Written like this to make ESLint happy
                    public client_id?: string = googleAuthMeta.getAttribute("content");
                }).then(async (_) => {}); // Have to explicitly call .then

            }
            if (noAuthMeta) {
                const username = GetCookie("no_auth_username");
                if (username)
                    onNoAuthLogin(username);
                document.getElementById("no-auth-submit").onclick = onNoAuthSubmitted;
            }

            return 1;
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
        GetAuthHeader: function(): string {
            if (!authState)
                return "";
            return authState.getAuthHeader();
        }
    }

})();
