import { useEffect } from "react";
import { useSharedDispatch, useSharedSelector } from "shared/site/utils/hooks/useShared";
import { CloseHeaderPopups, OpenHeaderPopup } from "shared/site/state/Header";
import { Popup } from "shared/site/components/Popup";
import { GetCookie, SetCookie } from "shared/site/utils/Cookies";

type Props = {
    version: string;
    cookieKey: string;
    children?: React.ReactNode;
};

export const ChangelogPopup = ({ version, cookieKey, children }: Props) => {
    const { curPopup } = useSharedSelector((state) => ({ curPopup: state.header.curPopup }));
    const dispatch = useSharedDispatch();

    useEffect(() => {
        const lastSeenVersion = GetCookie(cookieKey);

        if (lastSeenVersion === "") {
            // No changelog cookie found
            // TODO: For the *next* version, we shouldn't show it to brand new users
            // (only those that have a specifically older version set).
            dispatch(OpenHeaderPopup("changelog"));

            // Initialize the cookie to current version
            SetCookie(cookieKey, version);
        } else if (lastSeenVersion !== version) {
            // Version mismatch, show them the changelog
            dispatch(OpenHeaderPopup("changelog"));
            SetCookie(cookieKey, version);
        }
    }, [dispatch, cookieKey, version]);

    return (
        <Popup
            title={`What's New in v${version}`}
            isOpen={curPopup === "changelog"}
            width={40}
            close={() => dispatch(CloseHeaderPopups())}
        >
            {children}
        </Popup>
    );
};
