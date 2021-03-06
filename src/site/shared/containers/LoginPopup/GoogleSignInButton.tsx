import {useEffect} from "react";
import {connect} from "react-redux";

import {GoogleAuthState} from "shared/api/auth/GoogleAuthState";

import {SharedAppState} from "shared/state";
import {Login} from "shared/state/UserInfo/actions";


type OwnProps = {}
type StateProps = {}
type DispatchProps = {
    Login: typeof Login;
}

type Props = StateProps & DispatchProps & OwnProps;
const _GoogleAuthButton = ({ Login }: Props) => {
    useEffect(() => {
        // Render sign in button
        gapi.signin2.render("login-popup-google-signin", {
            "scope": "profile email",
            "width": 180,
            "height": 60,
            "longtitle": false,
            "onsuccess": (_) => Login(new GoogleAuthState()),
            "onfailure": (e) => { if (e.error !== "popup_closed_by_user") throw new Error(e.error); }
        });
    }, [Login]);

    return (<div id="login-popup-google-signin"></div>);
}


export const GoogleAuthButton = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    undefined,
    { Login } as any
)(_GoogleAuthButton);
