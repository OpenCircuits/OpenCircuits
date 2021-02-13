import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";


export const HeaderRight = () => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton />
            <DownloadMenuDropdown />
            <SignInOutButtons />
        </div>
    );
}
