import {useLayoutEffect} from "react";

import {usePageVisibility} from "shared/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/containers/MainDesigner";

import {SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import "./index.scss";

import {useMainCircuit} from "shared/utils/hooks/useCircuit";


export const DigitalMainDesigner = () => {
    const isPageVisible = usePageVisibility();
    const circuit = useMainCircuit();

    useLayoutEffect(() => {
        // if (isPageVisible)
        //     info.designer.resume();
        // else
        //     info.designer.pause();
    }, [circuit, isPageVisible]);

    return (
        <MainDesigner
            otherPlace={(pos, itemKind: string, num, smartPlaceOptions: SmartPlaceOptions) => {
                if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                    // circuit.smartPlace(itemKind, smartPlaceOptions, num, pos);
                    return true;
                }
                return false;
            }} />
    );
}
