import {useState} from "react";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";
import {SettingsMenu} from "./SettingsMenu";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderRight = ({ helpers }: Props) => {
    const [isHidden, setHidden] = useState(true);

    return (
        <div className="header__right">
            <button type="button" onClick={() => setHidden(!isHidden)}>
                <img className="expand" src={isHidden ? "img/icons/expand.svg" : "img/icons/collapse.svg"} alt="" />
            </button>
            <div className={`header__right__btns ${isHidden ? "header__right__collapsed" : ""}`}>
                <SignInOutButtons />
                <DownloadMenuDropdown helpers={helpers} />
                <OpenFileButton helpers={helpers} />
                <SettingsMenu helpers={helpers} />
                <TutorialDropdown />
            </div>
        </div>
    );
}
