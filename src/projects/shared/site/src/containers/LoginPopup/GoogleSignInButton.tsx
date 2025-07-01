import {GoogleLogin} from "@react-oauth/google";

import {useSharedDispatch} from "shared/site/utils/hooks/useShared";

import {GoogleAuthState} from "shared/site/api/auth/GoogleAuthState";

import {CloseHeaderPopups} from "shared/site/state/Header";

import {Login} from "shared/site/state/thunks/User";


export const GoogleAuthButton = () => {
    const dispatch = useSharedDispatch();

    return (
        <GoogleLogin
            auto_select
            onSuccess={(creds) => {
                dispatch(Login(new GoogleAuthState(creds.credential!)));
                dispatch(CloseHeaderPopups());
            }}
            onError={() => {
                throw new Error("Failed to login with Google!");
            }} />
    );
}
