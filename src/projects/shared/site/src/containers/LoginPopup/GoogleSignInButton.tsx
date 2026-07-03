import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";

import {useSharedDispatch} from "shared/site/utils/hooks/useShared";
import {CloseHeaderPopups} from "shared/site/state/Header";

import googleIcon from "./google.svg";

export const GoogleAuthButton = () => {
    const dispatch = useSharedDispatch();

    return (
        <div className="login-popup-google-signin">
            <button type="button" className="google-sign-in-btn" onClick={async () => {
                const provider = new GoogleAuthProvider();
                const auth = getAuth();
                try {
                    await signInWithPopup(auth, provider);
                    dispatch(CloseHeaderPopups());
                } catch (e) {
                    console.error("Login failed:", e);
                }
            }}>
                <img src={googleIcon} alt="Google" className="google-icon" />
            </button>
        </div>
    );
}
