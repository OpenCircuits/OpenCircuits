import {useLayoutEffect} from "react";

import {usePageVisibility} from "shared/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/containers/MainDesigner";

// import {SmartPlaceOptions} from "site/digital/utils/DigitalCreate";
import {useMainDigitalDesigner} from "site/digital/utils/hooks/useDigitalDesigner";

import "./index.scss";

// import {useMainCircuit} from "shared/utils/hooks/useCircuit";


export const DigitalMainDesigner = () => {
    const designer = useMainDigitalDesigner();
    const isPageVisible = usePageVisibility();

    useLayoutEffect(() => {
        // TODO
        // if (isPageVisible)
        //     info.designer.resume();
        // else
        //     info.designer.pause();
    }, [designer, isPageVisible]);

    return (
        <MainDesigner
            otherPlace={(pos, itemKind, num, smartPlaceOptions) => {
                // if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                //     // circuit.smartPlace(itemKind, smartPlaceOptions, num, pos);
                //     return true;
                // }
                return false;
            }} />
    );
}
