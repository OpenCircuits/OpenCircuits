import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {HeaderPopups} from "shared/state/Header/state";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {UtilitiesDropdown} from "./UtilitiesDropdown";
import {SignInOutButtons} from "./SignInOutButtons";
import {SettingsMenu} from "./SettingsMenu";
import {Utility} from "./UtilitiesDropdown";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
    extraUtilities: Utility[];
}
export const HeaderRight = ({ helpers, extraUtilities }: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <SettingsMenu helpers={helpers} />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            {extraUtilities.length > 0 && // Render only if there are tools
                <UtilitiesDropdown extraUtilities={extraUtilities} />
            }
            <SignInOutButtons />
        </div>
    );
}
