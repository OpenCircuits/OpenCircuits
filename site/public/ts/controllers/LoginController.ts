export const LoginController = (() => {
    const loginPopup = document.getElementById("login-popup");
    const overlay = document.getElementById("overlay");

    const loginHeaderContainer = document.getElementById("header-login-container");
    const loginHeaderButton = document.getElementById("header-signin-button");
    const logoutHeaderButton = document.getElementById("header-signout-button");

    let isOpen = false;
    let disabled = false;

    const toggle = function(): void {
        loginPopup.classList.toggle("invisible");
        overlay.classList.toggle("invisible");
    }

    const onLogin = function(u: gapi.auth2.GoogleUser): void {
        console.log(u.getBasicProfile().getName());
        loginHeaderContainer.classList.add("hide");
        logoutHeaderButton.classList.remove("hide");
        if (LoginController.IsOpen())
            LoginController.Toggle();
    }

    const onLogout = function(): void {
        loginHeaderContainer.classList.remove("hide");
        logoutHeaderButton.classList.add("hide");
    }

    const onLoginError = function(e: {error: string}): void {
        console.log(e);
    }

    return {
        Init: function(resolve: (value?: unknown) => void): void {
            isOpen = false;

            loginHeaderButton.onclick = () => {
                LoginController.Toggle();
            };

            logoutHeaderButton.onclick = () => {
                const auth2 = gapi.auth2.getAuthInstance();
                auth2.signOut().then(onLogout);
            }

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
                    'onsuccess': onLogin,
                    'onfailure': onLoginError
                });

                gapi.load('auth2', () => {
                    const clientId = document.getElementsByName('google-signin-client_id')[0].getAttribute('content');
                    gapi.auth2.init({
                        client_id: clientId
                    }).then((auth2) => {
                        console.log(auth2.isSignedIn.get());
                        resolve(1);
                    });
                });
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
        }
    }

})();
