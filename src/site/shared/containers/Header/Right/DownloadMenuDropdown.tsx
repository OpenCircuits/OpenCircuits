import {Dispatch} from "react";
import {connect} from "react-redux";

import {AppState} from "site/state";
import {AllSharedActions} from "site/state/actions";
import {HeaderMenus} from "site/state/Header/state";
import {OpenHeaderMenu, CloseHeaderMenus} from "site/state/Header/actions";

import {Dropdown} from "./Dropdown";


type OwnProps = {}
type StateProps = {
    curMenu: HeaderMenus;
}
type DispatchProps = {
    openMenu: (menu: HeaderMenus) => void;
    closeMenus: () => void;
}

type Props = StateProps & DispatchProps & OwnProps;
const _DownloadMenuDropdown = ({ curMenu, openMenu, closeMenus }: Props) => (
    <Dropdown open={(curMenu === "download")}
              onClick={() => openMenu("download")}
              onClose={() => closeMenus()}
              btnInfo={{title: "Download current scene", src: "img/icons/download.svg"}}>
        <div title="Download circuit locally">
            <img src="img/icons/download.svg" height="100%" alt="Download current scene"/>
            <span>Download</span>
        </div>
        <div title="Save circuit as PDF">
            <img src="img/icons/pdf_download.svg" height="100%" alt="Download current scene as PDF"/>
            <span>Download as PDF</span>
        </div>
        <div title="Save circuit as PNG">
            <img src="img/icons/png_download.svg" height="100%" alt="Download current scene as PNG"/>
            <span>Download as PNG</span>
        </div>
    </Dropdown>
);


/*
 * Redux state connection
 */
const MapState = (state: AppState) => ({
    curMenu: state.header.curMenu
});
const MapDispatch = (dispatch: Dispatch<AllSharedActions>) => ({
    openMenu:   (menu: HeaderMenus) => dispatch(OpenHeaderMenu(menu)),
    closeMenus: ()                  => dispatch(CloseHeaderMenus())
});
export const DownloadMenuDropdown = connect<StateProps, DispatchProps, OwnProps, AppState>(MapState, MapDispatch)(_DownloadMenuDropdown);
