import {useLayoutEffect} from "react";

import {usePageVisibility} from "shared/site/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/site/containers/MainDesigner";

// import {SmartPlaceOptions} from "digital/site/utils/DigitalCreate";
import {useMainDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

import "./index.scss";

// import {useMainCircuit} from "shared/site/utils/hooks/useCircuit";


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
