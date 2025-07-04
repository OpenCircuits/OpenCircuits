import {useRef} from "react";

import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth";


export const GoogleAuthButton = () => {
    const signInBtn = useRef<HTMLDivElement>(null);

    return (
        <div ref={signInBtn}>
            <button type="button" onClick={async () => {
                const provider = new GoogleAuthProvider();
                const auth = getAuth();
                await signInWithPopup(auth, provider);
            }}>
                LOGIN
            </button>
        </div>
    );
}
