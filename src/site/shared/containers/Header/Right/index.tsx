import {TutorialDropdown} from "./TutorialDropdown";
import {OnLoadFunc, OpenFileButton} from "./OpenFileButton";
import {DownloadMenuDropdown, OnDownloadFunc} from "./DownloadMenuDropdown";
import {SignInOutButtons} from "./SignInOutButtons";

import "./index.scss";


type Props = {
    onLoad: OnLoadFunc;
    onDownload: OnDownloadFunc;
}
export const HeaderRight = ({onLoad, onDownload}: Props) => {
    return (
        <div className="header__right">
            <TutorialDropdown />
            <OpenFileButton onLoad={onLoad} />
            <DownloadMenuDropdown onDownload={onDownload} />
            <SignInOutButtons />
        </div>
    );
}
