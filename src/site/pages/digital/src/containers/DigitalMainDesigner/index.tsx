import {DigitalComponent, DigitalPort} from "core/models/types/digital";
import {Signal}                        from "digital/models/sim/Signal";
import {useLayoutEffect}               from "react";

import {DEFAULT_ON_COLOR, METASTABLE_COLOR} from "core/utils/Constants";

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
    }, [info, isPageVisible]);

    return (
        <MainDesigner
            otherPlace={(pos, itemKind: DigitalComponent["kind"], num, smartPlaceOptions: SmartPlaceOptions) => {
                if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                    circuit.smartPlace(itemKind, smartPlaceOptions, num, pos);
                    return true;
                }
                return false;
            }} />
    );
}
