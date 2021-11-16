import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {OpenHeaderMenu, CloseHeaderMenus} from "shared/state/Header";

import {Dropdown} from "./Dropdown";


type Props = {
    helpers: CircuitInfoHelpers;
}
export const DownloadMenuDropdown = ({ helpers: {SaveCircuitToFile} }: Props) => {
    const {curMenu} = useSharedSelector(
        state => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();

    return (
        <Dropdown open={(curMenu === "download")}
                  onClick={() => dispatch(OpenHeaderMenu("download"))}
                  onClose={() => dispatch(CloseHeaderMenus())}
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
}
