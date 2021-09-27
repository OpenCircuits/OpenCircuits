import {useEffect} from "react";

import {useSharedDispatch} from "shared/utils/hooks/useShared";

import {GoogleAuthState} from "shared/api/auth/GoogleAuthState";

import {CloseHeaderPopups} from "shared/state/Header";
import {Login} from "shared/state/thunks/User";


export const GoogleAuthButton = () => {
    const dispatch = useSharedDispatch();

    function onLogin(success: boolean) {
        if (success) {
            dispatch(Login(new GoogleAuthState()));
            dispatch(CloseHeaderPopups());
        } // Else don't login or close
    }

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

        return () => {
            throw new Error("Google Sign In Button effect happened again! This should not happen!");
        }
    }, []);

    return (<div id="login-popup-google-signin"></div>);
}
