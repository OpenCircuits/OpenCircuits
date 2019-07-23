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
