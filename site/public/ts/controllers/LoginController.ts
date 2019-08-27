import $ from "jquery";

import ClientConfig = gapi.auth2.ClientConfig;

import {GetCookie} from "../utils/Cookies";
import {LoadDynamicScript} from "../utils/Script";

import {GoogleAuthState} from "../utils/auth/GoogleAuthState";
import {AuthState} from "../utils/auth/AuthState";
import {NoAuthState} from "../utils/auth/NoAuthState";

export const LoginController = (() => {
    const loginPopup = $("#login-popup");
    const overlay = $("#overlay");

    const loginHeaderContainer = $("#header-login-container");
    const loginHeaderButton = $("#header-signin-button");
    const logoutHeaderButton = $("#header-signout-button");

    const saveHeaderButton = $("#header-save-button");

    let isOpen = false;
    let disabled = false;

    let authState: AuthState = undefined;

    // Put authentication type meta-tags here (used to determine if an auth method is enabled)
    const noAuthMeta = $("#no_auth_enable");
    const googleAuthMeta = $("#google-signin-client_id");

    const onLogin = function(): void {
        loginHeaderContainer.addClass("hide");
        saveHeaderButton.removeClass("hide");
        logoutHeaderButton.removeClass("hide");
        LoginController.Hide();
    }

    const onLogout = function(): void {
        authState = undefined;
        loginHeaderContainer.removeClass("hide");
        saveHeaderButton.addClass("hide");
        logoutHeaderButton.addClass("hide");
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
        const username = $("#no-auth-user-input").val() as string;
        if (username === "") {
            alert("User Name must not be blank");
            return;
        }
        onNoAuthLogin(username);
    }

    const show = function(): void {
        loginPopup.removeClass("invisible");
        overlay.removeClass("invisible");
    }
    const hide = function(): void {
        loginPopup.addClass("invisible");
        overlay.addClass("invisible");
    }

    return {
        Init: async function(): Promise<number> {
            isOpen = false;

            loginHeaderButton.click(() => LoginController.Show());
            overlay.click(() => LoginController.Hide());

            logoutHeaderButton.click(async () => {
                if (authState)
                    await authState.logOut();
                onLogout();
            });


            // Setup each auth method if they are loaded in the page
            if (googleAuthMeta.length > 0) {
                // Load GAPI script
                await LoadDynamicScript("https://apis.google.com/js/platform.js");

                // Render sign in button
                gapi.signin2.render("login-popup-google-signin", {
                    "scope": "profile email",
                    "width": 120,
                    "height": 36,
                    "longtitle": false,
                    "onsuccess": onGoogleLogin,
                    "onfailure": onLoginError
                });

                // Load 'auth2' from GAPI and then initialize w/ meta-data
                await new Promise<void>((resolve) => gapi.load("auth2", resolve));
                await gapi.auth2.init(new class implements ClientConfig {
                    // Written like this to make ESLint happy
                    public client_id?: string = googleAuthMeta[0].getAttribute("content");
                }).then(async (_) => {}); // Have to explicitly call .then
            }
            if (noAuthMeta.length > 0) {
                const username = GetCookie("no_auth_username");
                if (username)
                    onNoAuthLogin(username);
                $("#no-auth-submit").click(onNoAuthSubmitted);
            }

            return 1;
        },
        Show: function(): void {
            if (disabled)
                return;

            isOpen = true;
            show();
        },
        Hide: function(): void {
            if (disabled)
                return;

            isOpen = false;
            hide();
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
