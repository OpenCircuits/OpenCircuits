import {connect} from "react-redux";

import {SharedAppState} from "shared/state";
import {HeaderMenus} from "shared/state/Header/state";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header/actions";

import {Dropdown} from "./Dropdown";


type OwnProps = {
    helpers: CircuitInfoHelpers;
}
type StateProps = {
    curMenu: HeaderMenus;
}
type DispatchProps = {
    OpenHeaderMenu: typeof OpenHeaderMenu;
    CloseHeaderMenus: typeof CloseHeaderMenus;
}

type Props = StateProps & DispatchProps & OwnProps;
const _DownloadMenuDropdown = ({ helpers: {SaveCircuitToFile}, curMenu, OpenHeaderMenu, CloseHeaderMenus }: Props) => (
    <Dropdown open={(curMenu === "download")}
              onClick={() => OpenHeaderMenu("download")}
              onClose={() => CloseHeaderMenus()}
              btnInfo={{title: "Download current scene", src: "img/icons/download.svg"}}>
        <div title="Download circuit locally" onClick={() => SaveCircuitToFile("circuit")}>
            <img src="img/icons/download.svg" height="100%" alt="Download current scene"/>
            <span>Download</span>
        </div>
        <div title="Save circuit as PDF" onClick={() => SaveCircuitToFile("pdf")}>
            <img src="img/icons/pdf_download.svg" height="100%" alt="Download current scene as PDF"/>
            <span>Download as PDF</span>
        </div>
        <div title="Save circuit as PNG" onClick={() => SaveCircuitToFile("png")}>
            <img src="img/icons/png_download.svg" height="100%" alt="Download current scene as PNG"/>
            <span>Download as PNG</span>
        </div>
    </Dropdown>
);


export const DownloadMenuDropdown = connect<StateProps, DispatchProps, OwnProps, SharedAppState>(
    (state: SharedAppState) => ({ curMenu: state.header.curMenu }),
    { OpenHeaderMenu, CloseHeaderMenus }
)(_DownloadMenuDropdown);
