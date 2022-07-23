import {Fragment, useState} from "react";

import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";

import {NoAuthState} from "shared/api/auth/NoAuthState";

import {CloseHeaderPopups} from "shared/state/Header";

import {Login} from "shared/state/thunks/User";

import {InputField} from "shared/components/InputField";
import {Popup}      from "shared/components/Popup";

import {GoogleAuthButton} from "./GoogleSignInButton";

import "./index.scss";


export const LoginPopup = () => {
    const { curPopup } = useSharedSelector(
        (state) => ({ curPopup: state.header.curPopup })
    );
    const dispatch = useSharedDispatch();
    const [username, setUsername] = useState("");

    return (
        <Popup title="Login"
               className="login__popup"
               isOpen={(curPopup === "login")}
               close={() => dispatch(CloseHeaderPopups())}>
            {(process.env.OC_AUTH_TYPES ?? "").trim().length > 0 &&
              process.env.OC_AUTH_TYPES!.split(" ").map((s) => (
                  <Fragment key={`login-popup-auth-${s}`}>
                      {s === "google" ? (
                          <GoogleAuthButton />
                    ) : (
                        <div>
                            <div className="login__popup__label">NoAuth Login</div>
                            <div>
                                <InputField type="text" placeholder="username"
                                            value={username} onChange={(e) => setUsername(e.target.value.trim())} />
                            </div>
                            <button type="button" onClick={() => {
                                if (username === "") {
                                    alert("User name must not be blank!")
                                    return;
                                }
                                dispatch(Login(new NoAuthState(username)));
                                dispatch(CloseHeaderPopups());
                            }}>
                                Submit
                            </button>
                        </div>
                    )}
                      <hr />
                  </Fragment>
            ))}
        </Popup>
    );
}
