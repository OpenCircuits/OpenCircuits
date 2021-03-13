import {useEffect} from "react";

import {Login} from "shared/state/UserInfo/actions";


type Props = {
    onLogin: (success: boolean) => void;
}
export const GoogleAuthButton = ({ onLogin }: Props) => {
    useEffect(() => {
        // Render sign in button
        gapi.signin2.render("login-popup-google-signin", {
            "scope": "profile email",
            "width": 180,
            "height": 60,
            "longtitle": false,
            "onsuccess": (_) => onLogin(true),
            "onfailure": (e) => { if (e.error !== "popup_closed_by_user") throw new Error(e.error); onLogin(false); }
        });
    }, [Login]);

    return (<div id="login-popup-google-signin"></div>);
}
