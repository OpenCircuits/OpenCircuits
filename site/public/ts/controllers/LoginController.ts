export const LoginController = (() => {
    const loginPopup = document.getElementById("login-popup");
    const overlay = document.getElementById("overlay");

    const loginHeaderButton = document.getElementById("header-signin-button");

    let isOpen = false;
    let disabled = false;

    const toggle = function(): void {
        loginPopup.classList.toggle("invisible");
        overlay.classList.toggle("invisible");
    }

    const onGapiSuccess = function(u: gapi.auth2.GoogleUser): void {
        console.log(u.getBasicProfile().getName());
    }

    const onGapiError = function(e: {error: string}): void {
        console.log(e);
    }

    return {
        Init: function(): void {
            isOpen = false;

            loginHeaderButton.onclick = () => {
                LoginController.Toggle();
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
                    'onsuccess': onGapiSuccess,
                    'onfailure': onGapiError
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
