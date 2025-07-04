import {useSharedDispatch} from "shared/site/utils/hooks/useShared";

import {useEffect, useRef} from "react";


export const GoogleAuthButton = () => {
    const dispatch = useSharedDispatch();

    const signInBtn = useRef<HTMLDivElement>(null);

    useEffect(() => {
        google.accounts.id.renderButton(signInBtn.current!, {
            type:  "standard",
            theme: "outline",
            size:  "large",
            shape: "rectangular",
        });
    }, [signInBtn, dispatch]);

    return (
        <div ref={signInBtn}></div>
    );
}
