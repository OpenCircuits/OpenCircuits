import {useLayoutEffect} from "react";

import {usePageVisibility} from "shared/site/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/site/containers/MainDesigner";

import {SmartPlace} from "digital/site/utils/SmartPlace";
import {useCurDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

import "./index.scss";
import {DigitalCircuit} from "digital/api/circuit/public";
import {SmartPlaceOptions} from "digital/site/utils/DigitalCreate";

// import {useMainCircuit} from "shared/site/utils/hooks/useCircuit";


export const DigitalMainDesigner = ({ circuit }: {circuit: DigitalCircuit}) => {
    const designer = useCurDigitalDesigner();
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
                const smartPlaceOption = Array.isArray(smartPlaceOptions) ? smartPlaceOptions.at(0) : undefined;
                if (smartPlaceOption === SmartPlaceOptions.Full ||
                    smartPlaceOption === SmartPlaceOptions.Inputs ||
                    smartPlaceOption === SmartPlaceOptions.Outputs) {
                    SmartPlace(pos, itemKind, circuit, num, smartPlaceOption);
                    return true;
                }
                return false;
            }} />
    );
}
