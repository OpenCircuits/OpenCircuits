/* eslint-disable jsx-a11y/img-redundant-alt */
import {SaveFile} from "shared/site/utils/Exporter";

import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {CloseHeaderMenus, OpenHeaderMenu, OpenHeaderPopup} from "shared/site/state/Header";

import {useCurDesigner}   from "shared/site/utils/hooks/useDesigner";
import {CircuitHelpers} from "shared/site/utils/CircuitHelpers";

import {Dropdown} from "../Dropdown";

import downloadIcon    from "./download.svg";
import downloadPngIcon from "./png_download.svg";


export const DownloadMenuDropdown = () => {
    const mainDesigner = useCurDesigner();
    const { curMenu, circuitName } = useSharedSelector(
        (state) => ({ curMenu: state.header.curMenu, circuitName: state.circuit.name })
    );
    const dispatch = useSharedDispatch();

    const onDownloadClick = () => {
        // Convert to URL data
        const { data } = CircuitHelpers.Serialize(mainDesigner.circuit);
        const url = URL.createObjectURL(data);

        SaveFile(url, circuitName, "circuit");
    }

    return (
        <Dropdown open={(curMenu === "download")}
                  btnInfo={{ title: "Download current scene", src: downloadIcon }}
                  onClick={() => dispatch(OpenHeaderMenu("download"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            <div role="button" tabIndex={0}
                 title="Download circuit locally"
                 onClick={onDownloadClick}>
                <img src={downloadIcon} height="100%" alt="Download current scene" />
                <span>Download</span>
            </div>
            <div role="button" tabIndex={0}
                 title="Export as Image"
                 onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup("image_exporter"));
                }}>
                <img src={downloadPngIcon} height="100%" alt="Export current scene as an image" />
                <span>Export Image</span>
            </div>
        </Dropdown>
    );
}
