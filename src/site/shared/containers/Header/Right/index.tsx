import {TutorialDropdown} from "./TutorialDropdown";
import {OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown, OnDownloadFunc} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";


type Props = {
    onDownload: OnDownloadFunc
}
export const HeaderRight = ({onDownload}: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton />
            <DownloadMenuDropdown onDownload={onDownload} />
            <SignInOutButtons />
        </div>
    );
}
