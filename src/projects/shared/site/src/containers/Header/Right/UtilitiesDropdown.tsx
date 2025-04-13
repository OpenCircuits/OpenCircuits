import {useEffect, useState} from "react";

import {DEV_CACHED_CIRCUIT_FILE, OVERWRITE_CIRCUIT_MESSAGE} from "shared/site/utils/Constants";

// import {useAPIMethods} from "shared/site/utils/ApiMethods";

import {useAPIMethods, VersionConflictResolver} from "shared/site/utils/ApiMethods";
import {useMainDesigner}                      from "shared/site/utils/hooks/useDesigner";
import {useSharedDispatch, useSharedSelector} from "shared/site/utils/hooks/useShared";

import {DevCreateFile, DevGetFile, DevListFiles} from "shared/site/api/Dev";

import {CloseHeaderMenus, HeaderPopups, OpenHeaderMenu, OpenHeaderPopup} from "shared/site/state/Header";

import {Dropdown} from "./Dropdown";


export type Utility = {
    popupName: HeaderPopups;
    img: string;
    text: string;
}

type Props = {
    extraUtilities: Utility[];
    versionConflictResolver: VersionConflictResolver;
}
export const UtilitiesDropdown = ({ extraUtilities, versionConflictResolver }: Props) => {
    const designer = useMainDesigner();
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
        DevListFiles().then((result) => {
            setEnableReload(result.includes(DEV_CACHED_CIRCUIT_FILE));
        })
    }, [setEnableReload]);

    const load = () => {
        dispatch(CloseHeaderMenus());
        if (isSaved || window.confirm(OVERWRITE_CIRCUIT_MESSAGE))
            LoadCircuit(DevGetFile(DEV_CACHED_CIRCUIT_FILE), versionConflictResolver);
    }

    return (
        <Dropdown open={(curMenu === "utilities")}
                  btnInfo={{ title: "Utilities", src: "img/icons/utilities.svg" }}
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
                        await DevCreateFile(JSON.stringify(designer.circuit.toSchema()), DEV_CACHED_CIRCUIT_FILE);
                        setEnableReload(true);
                     }}>
                    <img src="img/icons/bool_expr_input_icon.svg" height="100%" alt="Cache Circuit Icon" />
                    <span>Cache Circuit</span>
                </div>
                {enableReload && (
                    <div role="button" tabIndex={0}
                         onClick={load}>
                        <img src="img/icons/bool_expr_input_icon.svg" height="100%" alt="Reload Circuit Icon" />
                        <span>Reload Circuit</span>
                    </div>
                )}
            </>)}
        </Dropdown>
    );
}
