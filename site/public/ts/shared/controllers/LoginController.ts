import $ from "jquery";

import ClientConfig = gapi.auth2.ClientConfig;

import {GetCookie} from "../utils/Cookies";
import {LoadDynamicScript} from "../utils/Script";

import {GoogleAuthState} from "../../digital/auth/GoogleAuthState";
import {NoAuthState} from "../../digital/auth/NoAuthState";
import {MainDesignerController} from "./MainDesignerController";
import {RemoteController} from "./RemoteController";
import {SideNavController} from "./SideNavController";
import {addSetSavedCallback, setSAVED} from "core/utils/Config";

export class LoginController {
    private loginPopup: JQuery<HTMLElement> = $("#login-popup");
    private overlay:    JQuery<HTMLElement> = $("#overlay");

    private loginHeaderContainer: JQuery<HTMLElement> = $("#header-login-container");
    private loginHeaderButton:    JQuery<HTMLElement> = $("#header-signin-button");
    private logoutHeaderButton:   JQuery<HTMLElement> = $("#header-signout-button");

    private saveHeaderButton: JQuery<HTMLElement> = $("#header-save-button");

    private open: boolean;
    private disabled: boolean;

    // Put authentication type meta-tags here (used to determine if an auth method is enabled)
    private noAuthMeta:     JQuery<HTMLElement> = $("#no_auth_enable");
    private googleAuthMeta: JQuery<HTMLElement> = $("#google-signin-client_id");

    private sidenav: SideNavController;

    public constructor(main: MainDesignerController, sidenav: SideNavController) {
        this.sidenav = sidenav;

        this.open = false;
        this.disabled = false;

        this.loginHeaderButton.click(() => this.show());
        this.overlay.click(() => this.hide());

        this.logoutHeaderButton.click(async () => {
            RemoteController.Logout(() => this.onLogout());
        });

        this.saveHeaderButton.click(async () => {
            const data = main.saveCircuit();
            RemoteController.SaveCircuit(data, async () => {
                // set saved to true (which calls callbacks to set the button as invisible)
                setSAVED(true);
                return sidenav.updateUserCircuits();
            });
        });

        // add callback for saving to hide/show save button
        addSetSavedCallback((v) => {
            if (v)
                this.saveHeaderButton.addClass("invisible");
            else
                this.saveHeaderButton.removeClass("invisible");
        })
    }

    private onLogin(): void {
        this.loginHeaderContainer.addClass("hide");
        this.saveHeaderButton.removeClass("invisible");
        this.logoutHeaderButton.removeClass("hide");
        this.hide();

        this.sidenav.updateUserCircuits();
    }

    private onLogout(): void {
        this.loginHeaderContainer.removeClass("hide");
        this.saveHeaderButton.addClass("invisible");
        this.logoutHeaderButton.addClass("hide");

        this.sidenav.clearUserCircuits();
    }

    private onLoginError(e: {error: string}): void {
        console.error(e);
    }

    private onGoogleLogin(_: gapi.auth2.GoogleUser): void {
        RemoteController.Login(new GoogleAuthState(), () => this.onLogin());
    }

    private onNoAuthLogin(username: string): void {
        RemoteController.Login(new NoAuthState(username), () => this.onLogin());
    }

    private onNoAuthSubmitted(): void {
        const username = $("#no-auth-user-input").val() as string;
        if (username === "") {
            alert("User Name must not be blank");
            return;
        }
        this.onNoAuthLogin(username);
    }

    public async initAuthentication(): Promise<void> {
        // Setup each auth method if they are loaded in the page
        if (this.googleAuthMeta.length > 0) {
            // Load GAPI script
            await LoadDynamicScript("https://apis.google.com/js/platform.js");

            // Render sign in button
            gapi.signin2.render("login-popup-google-signin", {
                "scope": "profile email",
                "width": 120,
                "height": 36,
                "longtitle": false,
                "onsuccess": (_) => this.onGoogleLogin(_),
                "onfailure": (_) => this.onLoginError(_)
            });

            // Load 'auth2' from GAPI and then initialize w/ meta-data
            const clientId = this.googleAuthMeta[0].getAttribute("content");
            await new Promise<void>((resolve) => gapi.load("auth2", resolve));
            await gapi.auth2.init(new class implements ClientConfig {
                // Written like this to make ESLint happy
                public client_id?: string = clientId;
            }).then(async (_) => {}); // Have to explicitly call .then
        }
        if (this.noAuthMeta.length > 0) {
            const username = GetCookie("no_auth_username");
            if (username)
                this.onNoAuthLogin(username);
            $("#no-auth-submit").click(() => this.onNoAuthSubmitted());
        }
    }

    public show(): void {
        if (this.disabled)
            return;

        this.open = true;

        this.loginPopup.removeClass("invisible");
        this.overlay.removeClass("invisible");
    }

    public hide(): void {
        if (this.disabled)
            return;

        this.open = false;

        this.loginPopup.addClass("invisible");
        this.overlay.addClass("invisible");
    }

    public isOpen(): boolean {
        return this.open;
    }

    public Enable(): void {
        this.disabled = false;
    }

    public Disable(): void {
        this.disabled = true;
    }

}
