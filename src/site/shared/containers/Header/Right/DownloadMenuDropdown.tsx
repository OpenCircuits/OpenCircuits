import {connect} from "react-redux";

import {SharedAppState} from "shared/state";
import {HeaderMenus} from "shared/state/Header/state";
import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header/actions";

import {Dropdown} from "./Dropdown";


export type OnDownloadFunc = (type: "regular" | "pdf" | "png") => void;

type OwnProps = {
    onDownload: OnDownloadFunc;
}
type StateProps = {
    curMenu: HeaderMenus;
}
type DispatchProps = {
    OpenHeaderMenu: typeof OpenHeaderMenu;
    CloseHeaderMenus: typeof CloseHeaderMenus;
}

type Props = StateProps & DispatchProps & OwnProps;
const _DownloadMenuDropdown = ({ onDownload, curMenu, OpenHeaderMenu, CloseHeaderMenus }: Props) => (
    <Dropdown open={(curMenu === "download")}
              onClick={() => OpenHeaderMenu("download")}
              onClose={() => CloseHeaderMenus()}
              btnInfo={{title: "Download current scene", src: "img/icons/download.svg"}}>
        <div title="Download circuit locally" onClick={() => onDownload("regular")}>
            <img src="img/icons/download.svg" height="100%" alt="Download current scene"/>
            <span>Download</span>
        </div>
        <div title="Save circuit as PDF" onClick={() => onDownload("pdf")}>
            <img src="img/icons/pdf_download.svg" height="100%" alt="Download current scene as PDF"/>
            <span>Download as PDF</span>
        </div>
        <div title="Save circuit as PNG" onClick={() => onDownload("png")}>
            <img src="img/icons/png_download.svg" height="100%" alt="Download current scene as PNG"/>
            <span>Download as PNG</span>
        </div>
    </Dropdown>
);


export const DownloadMenuDropdown = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state: SharedAppState) => ({ curMenu: state.header.curMenu }),
    { OpenHeaderMenu, CloseHeaderMenus }
)(_DownloadMenuDropdown);
