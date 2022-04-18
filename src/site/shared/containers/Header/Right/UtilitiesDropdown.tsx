import {useEffect, useState} from "react";

import {DevCreateFile, DevGetFile, DevListFiles} from "shared/api/Dev";
import {HeaderPopups} from "shared/state/Header";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {OpenHeaderMenu, OpenHeaderPopup, CloseHeaderMenus} from "shared/state/Header";
import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {CircuitInfo} from "core/utils/CircuitInfo";

import {Dropdown} from "./Dropdown";


export type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
    enabled: boolean;
}

type Props = {
    extraUtilities: Utility[];
    helpers: CircuitInfoHelpers;
    info: CircuitInfo;
}

export const UtilitiesDropdown = ({ extraUtilities, helpers, info }: Props) => {
    const {curMenu} = useSharedSelector(
        state => ({ curMenu: state.header.curMenu })
    );
    const dispatch = useSharedDispatch();
    const [enableReload, setEnableReload] = useState(false);

    useEffect(() => {
        DevListFiles().then((result) => {
            setEnableReload(result.includes("devCached.circuit"));
        })
    });

    return (
    <Dropdown open={(curMenu === "utilities")}
              onClick={() => dispatch(OpenHeaderMenu("utilities"))}
              onClose={() => dispatch(CloseHeaderMenus())}
              btnInfo={{title: "Utilities", src: "img/icons/utilities.svg"}}>
        {extraUtilities.filter(utility => utility.enabled).map(utility => (
            <div key={utility.popupName}
                onClick={() => {
                    dispatch(CloseHeaderMenus());
                    dispatch(OpenHeaderPopup(utility.popupName));
                }}>
                <img src={utility.img} height="100%" alt="Wrench Icon for Utilities Dropdown" />
                <span>{utility.text}</span>
            </div>
        ))}
        {process.env.NODE_ENV === "development" &&
        <>
            <h1>Development</h1>
            <hr/>
            <div onClick={() => {
                    dispatch(CloseHeaderMenus());
                    DevCreateFile(helpers.GetSerializedCircuit(),"devCached.circuit");
                    setEnableReload(true);
                }}>
                <img src={"img/icons/bool_expr_input_icon.svg"} height="100%" alt="Cache Circuit Icon" />
                <span>Cache Circuit</span>
            </div>
            {enableReload &&
                <div onClick={() => {
                        dispatch(CloseHeaderMenus());
                        helpers.LoadCircuit(() => DevGetFile("devCached.circuit"));
                    }}>
                    <img src={"img/icons/bool_expr_input_icon.svg"} height="100%" alt="Reload Circuit Icon" />
                    <span>Reload Circuit</span>
                </div>
            }
        </>
        }
    </Dropdown>
    );
}
