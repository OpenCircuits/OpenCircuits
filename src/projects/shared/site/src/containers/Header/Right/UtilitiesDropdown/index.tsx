import {useEffect, useState} from "react";

import {DEV_CACHED_CIRCUIT_FILE, OVERWRITE_CIRCUIT_MESSAGE} from "shared/site/utils/Constants";

// import {useAPIMethods} from "shared/site/utils/ApiMethods";

import {useAPIMethods} from "shared/site/utils/ApiMethods";
import {useCurDesigner}                       from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {DevCreateFile, DevGetFile, DevListFiles} from "shared/site/api/Dev";

import {CloseHeaderMenus, HeaderPopups, OpenHeaderMenu, OpenHeaderPopup} from "shared/site/state/Header";

import {Dropdown} from "../Dropdown";
import {CircuitHelpers} from "shared/site/utils/CircuitHelpers";

import wrenchIcon from "./wrench.svg";
import cacheIcon  from "./cache.svg";


export type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    extraUtilities: Utility[];
}
export const UtilitiesDropdown = ({ extraUtilities }: Props) => {
    const designer = useCurDesigner();
    const { curMenu, isLocked, isSaved } = useSharedSelector(
        (state) => ({
            curMenu:  state.header.curMenu,
            isLocked: state.circuit.isLocked,
            isSaved:  state.circuit.isSaved,
        })
    );
    const { LoadCircuit } = useAPIMethods(designer.circuit);
    const dispatch = useSharedDispatch();

    const [enableReload, setEnableReload] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            DevListFiles().then((result) =>
                setEnableReload(result.includes(DEV_CACHED_CIRCUIT_FILE)));
        }
    }, [setEnableReload]);

    const load = () => {
        dispatch(CloseHeaderMenus());
        if (isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE))
            LoadCircuit(DevGetFile(DEV_CACHED_CIRCUIT_FILE));
    }

    return (
        <Dropdown open={(curMenu === "utilities")}
                  btnInfo={{ title: "Utilities", src: wrenchIcon }}
                  onClick={() => dispatch(OpenHeaderMenu("utilities"))}
                  onClose={() => dispatch(CloseHeaderMenus())}>
            {extraUtilities.map((utility) => (
                <div key={utility.popupName}
                     role="button" tabIndex={0}
                     className={`${isLocked ? "disabled" : ""}`}
                     onClick={() => {
                        if (isLocked)
                            return;
                        dispatch(CloseHeaderMenus());
                        dispatch(OpenHeaderPopup(utility.popupName));
                     }}>
                    <img src={utility.img} height="100%" alt="Wrench Icon for Utilities Dropdown" />
                    <span>{utility.text}</span>
                </div>
            ))}
            {process.env.NODE_ENV === "development" && (<>
                <h1>Development</h1>
                <hr />
                <div role="button" tabIndex={0}
                     onClick={async () => {
                        dispatch(CloseHeaderMenus());
                        await DevCreateFile(CircuitHelpers.SerializeAsString(designer.circuit), DEV_CACHED_CIRCUIT_FILE);
                        setEnableReload(true);
                     }}>
                    <img src={cacheIcon} height="100%" alt="Cache Circuit Icon" />
                    <span>Cache Circuit</span>
                </div>
                {enableReload && (
                    <div role="button" tabIndex={0}
                         onClick={load}>
                        <img src={cacheIcon} height="100%" alt="Reload Circuit Icon" />
                        <span>Reload Circuit</span>
                    </div>
                )}
            </>)}
        </Dropdown>
    );
}
