import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {ToolsDropdown} from "./ToolsDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const HeaderRight = ({ helpers }: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            <ToolsDropdown />
            <SignInOutButtons />
        </div>
    );
}
