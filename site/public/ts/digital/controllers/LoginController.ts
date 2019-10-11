import $ from "jquery";

import ClientConfig = gapi.auth2.ClientConfig;

import {GetCookie} from "../utils/Cookies";
import {LoadDynamicScript} from "../utils/Script";

import {GoogleAuthState} from "../auth/GoogleAuthState";
import {NoAuthState} from "../auth/NoAuthState";
import {MainDesignerController} from "../../shared/controllers/MainDesignerController";
import {Exporter} from "core/utils/io/Exporter";
import {HeaderController} from "./HeaderController";
import {RemoteController} from "./RemoteController";
import {SideNavController} from "./SideNavController";

export class LoginController {
    private loginPopup: JQuery<HTMLElement>;
    private overlay: JQuery<HTMLElement>;

    private loginHeaderContainer: JQuery<HTMLElement>;
    private loginHeaderButton: JQuery<HTMLElement>;
    private logoutHeaderButton: JQuery<HTMLElement>;

    private saveHeaderButton: JQuery<HTMLElement>;

    private open: boolean;
    private disabled: boolean;

    // Put authentication type meta-tags here (used to determine if an auth method is enabled)
    private noAuthMeta: JQuery<HTMLElement>;
    private googleAuthMeta: JQuery<HTMLElement>;

    public constructor() {
        this.loginPopup = $("#login-popup");
        this.overlay = $("#overlay");

        this.loginHeaderContainer = $("#header-login-container");
        this.loginHeaderButton = $("#header-signin-button");
        this.logoutHeaderButton = $("#header-signout-button");

        this.saveHeaderButton = $("#header-save-button");

        this.noAuthMeta = $("#no_auth_enable");
        this.googleAuthMeta = $("#google-signin-client_id");

        this.open = false;
        this.disabled = false;

        this.loginHeaderButton.click(() => this.show());
        this.overlay.click(() => this.hide());

        this.logoutHeaderButton.click(async () => {
            RemoteController.Logout(this.onLogout);
        });

        this.saveHeaderButton.click(async () => {
            const circuit = MainDesignerController.GetDesigner();
            const data = Exporter.WriteCircuit(circuit, HeaderController.GetProjectName());
            RemoteController.SaveCircuit(data, async () => {
                return SideNavController.UpdateUserCircuits();
            });
        });
    }

    private onLogin(): void {
        this.loginHeaderContainer.addClass("hide");
        this.saveHeaderButton.removeClass("hide");
        this.logoutHeaderButton.removeClass("hide");
        this.hide();

        SideNavController.UpdateUserCircuits();
    }

    private onLogout(): void {
        this.loginHeaderContainer.removeClass("hide");
        this.saveHeaderButton.addClass("hide");
        this.logoutHeaderButton.addClass("hide");

        SideNavController.ClearUserCircuits();
    }

    private onLoginError(e: {error: string}): void {
        console.error(e);
    }

    private onGoogleLogin(_: gapi.auth2.GoogleUser): void {
        RemoteController.Login(new GoogleAuthState(), this.onLogin);
    }

    private onNoAuthLogin(username: string): void {
        RemoteController.Login(new NoAuthState(username), this.onLogin);
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
                "onsuccess": this.onGoogleLogin,
                "onfailure": this.onLoginError
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
            $("#no-auth-submit").click(this.onNoAuthSubmitted);
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