import {useState} from "react";

import {DownloadMenuDropdown}      from "./DownloadMenuDropdown";
import {OpenFileButton}            from "./OpenFileButton";
import {SettingsMenu}              from "./SettingsMenu";
import {SignInOutButtons}          from "./SignInOutButtons";
import {TutorialDropdown}          from "./TutorialDropdown";
import {UtilitiesDropdown,Utility} from "./UtilitiesDropdown";

import "./index.scss";


type Props = {
    extraUtilities: Utility[];
}
export const HeaderRight = ({ extraUtilities }: Props) => {
    const [isHidden, setHidden] = useState(true);

    return (<div className="header__right">
        <div className="header__right__wrapper">
            <button type="button" onClick={() => setHidden(!isHidden)}>
                <img className="expand" src={isHidden ? "img/icons/expand.svg" : "img/icons/collapse.svg"}
                     width="40px" height="40px" alt="" />
            </button>

            <div className={`header__right__btns ${isHidden ? "header__right__collapsed" : ""}`}>
                <SignInOutButtons />
                {  // Render only if there are utilities or in dev mode for dev utilities
                (extraUtilities.length > 0 || process.env.NODE_ENV === "development") &&
                    <UtilitiesDropdown extraUtilities={extraUtilities} />
                }
                <DownloadMenuDropdown />
                <OpenFileButton />
                <SettingsMenu />
                <TutorialDropdown />
            </div>
        </div>
    </div>);
};
