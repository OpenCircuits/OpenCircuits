import {HeaderPopups} from "shared/state/Header";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {OpenHeaderMenu, OpenHeaderPopup, CloseHeaderMenus} from "shared/state/Header";

import {Dropdown} from "./Dropdown";


export type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    extraUtilities: Utility[];
}

export const UtilitiesDropdown = ({ extraUtilities }: Props) => {
    const {curMenu} = useSharedSelector(
        state => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();

    return (
    <Dropdown open={(curMenu === "utilities")}
              onClick={() => dispatch(OpenHeaderMenu("utilities"))}
              onClose={() => dispatch(CloseHeaderMenus())}
              btnInfo={{title: "Utilities", src: "img/icons/utilities.svg"}}>
        {extraUtilities.map(utility => (
            <div key={utility.popupName} onClick={() => { dispatch(CloseHeaderMenus()); dispatch(OpenHeaderPopup(utility.popupName)); }}>
                <img src={utility.img} height="100%" alt="Wrench Icon for Utilities Dropdown" />
                <span>{utility.text}</span>
            </div>
        ))}
    </Dropdown>
    );
}
