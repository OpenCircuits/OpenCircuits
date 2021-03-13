import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {HeaderPopups} from "shared/state/Header/state";

import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {ToolsDropdown} from "./ToolsDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";

type Tool = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    helpers: CircuitInfoHelpers;
    extraTools: Tool[];
}
export const HeaderRight = ({ helpers, extraTools }: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton helpers={helpers} />
            <DownloadMenuDropdown helpers={helpers} />
            {extraTools.length > 0 && // Render only if there are tools
                <ToolsDropdown extraTools={extraTools} />
            }
            <SignInOutButtons />
        </div>
    );
}
