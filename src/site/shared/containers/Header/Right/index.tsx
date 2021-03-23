import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {HeaderPopups} from "shared/state/Header/state";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {UtilitiesDropdown} from "./UtilitiesDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";

type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    helpers: CircuitInfoHelpers;
    extraUtilities: Utility[];
}
export const HeaderRight = ({ helpers, extraUtilities }: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            {extraUtilities.length > 0 && // Render only if there are tools
                <UtilitiesDropdown extraUtilities={extraUtilities} />
            }
            <SignInOutButtons />
        </div>
    );
}
