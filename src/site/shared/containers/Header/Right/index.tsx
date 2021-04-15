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
    return (
        <div className="header__right">
            <TutorialDropdown />
            <SettingsMenu helpers={helpers} />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            <SignInOutButtons />
        </div>
    );
}
