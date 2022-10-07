import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {OpenHeaderPopup} from "shared/state/Header";
import {Logout}          from "shared/state/UserInfo";

import "./index.scss";


export const SignInOutButtons = () => {
    const { isLoggedIn } = useSharedSelector(
        (state) => ({ isLoggedIn: state.user.isLoggedIn })
    );
    const dispatch = useSharedDispatch();

    return (
        <div className="header__right__account">
            <button type="button"
                    title="Sign in"
                    style={{ display: (isLoggedIn ? "none" : "initial") }}
                    onClick={() => dispatch(OpenHeaderPopup("login"))}>Sign In</button>

            <button type="button"
                    title="Sign out"
                    style={{ display: (isLoggedIn ? "initial" : "none") }}
                    onClick={() => dispatch(Logout())}>Sign Out</button>
        </div>
    );
}
