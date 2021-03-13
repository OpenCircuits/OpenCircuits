import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {ToolsDropdown} from "./ToolsDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
    extraToolsPopupNames: string[];
    extraToolsimgNames: string[];
}
export const HeaderRight = ({ helpers, extraToolsPopupNames, extraToolsimgNames }: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            <ToolsDropdown extraToolsPopupNames={extraToolsPopupNames} extraToolsimgNames={extraToolsimgNames} />
            <SignInOutButtons />
        </div>
    );
}
