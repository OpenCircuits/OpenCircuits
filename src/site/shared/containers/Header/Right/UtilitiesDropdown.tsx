import {useEffect, useState} from "react";

import {DEV_CACHED_CIRCUIT_FILE} from "shared/utils/Constants";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";
import {useSharedDispatch, useSharedSelector} from "shared/utils/hooks/useShared";
import {DevCreateFile, DevGetFile, DevListFiles} from "shared/api/Dev";
import {OpenHeaderMenu, OpenHeaderPopup, CloseHeaderMenus, HeaderPopups} from "shared/state/Header";

import {Dropdown} from "./Dropdown";


export type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    helpers: CircuitInfoHelpers;
    extraUtilities: Utility[];
}
export const UtilitiesDropdown = ({ helpers, extraUtilities }: Props) => {
    const { curMenu } = useSharedSelector(state => ({ curMenu: state.header.curMenu }));
    const dispatch = useSharedDispatch();

    const [enableReload, setEnableReload] = useState(false);

    useEffect(() => {
        DevListFiles().then((result) => {
            setEnableReload(result.includes(DEV_CACHED_CIRCUIT_FILE));
        })
    }, [setEnableReload]);

    return (
    <Dropdown open={(curMenu === "utilities")}
              onClick={() => dispatch(OpenHeaderMenu("utilities"))}
              onClose={() => dispatch(CloseHeaderMenus())}
              btnInfo={{ title: "Utilities", src: "img/icons/utilities.svg" }}>
        {extraUtilities.map(utility => (
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
            <div onClick={async () => {
                    dispatch(CloseHeaderMenus());
                    await DevCreateFile(helpers.GetSerializedCircuit(), DEV_CACHED_CIRCUIT_FILE);
                    setEnableReload(true);
                }}>
                <img src={"img/icons/bool_expr_input_icon.svg"} height="100%" alt="Cache Circuit Icon" />
                <span>Cache Circuit</span>
            </div>
            {enableReload &&
                <div onClick={() => {
                        dispatch(CloseHeaderMenus());
                        helpers.LoadCircuit(() => DevGetFile(DEV_CACHED_CIRCUIT_FILE));
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
