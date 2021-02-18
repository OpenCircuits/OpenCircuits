import {connect} from "react-redux";
import {SharedAppState} from "shared/state";
import {OpenHeaderPopup} from "shared/state/Header/actions";
import {Logout} from "shared/state/UserInfo/actions";

import "./index.scss";


type OwnProps = {}
type StateProps = {
    isLoggedIn: boolean;
}
type DispatchProps = {
    Logout: typeof Logout;
    OpenHeaderPopup: typeof OpenHeaderPopup;
}

type Props = StateProps & DispatchProps & OwnProps;
const _SignInOutButtons = ({isLoggedIn, Logout, OpenHeaderPopup}: Props) => (
    <div className="header__right__account">
        <button title="Sign in"
                style={{ display: (isLoggedIn ? "none" : "initial") }}
                onClick={() => OpenHeaderPopup("login")}>Sign In</button>

        <button title="Sign out"
                style={{ display: (isLoggedIn ? "initial" : "none") }}
                onClick={() => Logout()}>Sign Out</button>
    </div>
);

export const SignInOutButtons = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state) => ({ isLoggedIn: state.user.isLoggedIn }),
    { Logout, OpenHeaderPopup }
)(_SignInOutButtons);
