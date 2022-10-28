import {useLayoutEffect} from "react";

import {DEFAULT_ON_COLOR, METASTABLE_COLOR} from "core/utils/Constants";

import {DigitalComponent, DigitalPort} from "core/models/types/digital";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {Signal} from "digital/models/sim/Signal";

import {usePageVisibility} from "shared/utils/hooks/usePageVisibility";

import {MainDesigner} from "shared/containers/MainDesigner";

import {SmartPlace, SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import "./index.scss";


type Props = {
    info: DigitalCircuitInfo;
}
export const DigitalMainDesigner = ({ info }: Props) => {
    const isPageVisible = usePageVisibility();

    useLayoutEffect(() => {
        // if (isPageVisible)
        //     info.designer.resume();
        // else
        //     info.designer.pause();
    }, [info, isPageVisible]);

    return (
        <MainDesigner
            info={info}
            otherPlace={(pos, itemKind: DigitalComponent["kind"], num, smartPlaceOptions: SmartPlaceOptions) => {
                const z = info.viewManager.getTopDepth() + 1;
                if (smartPlaceOptions !== SmartPlaceOptions.Off) {
                    info.history.add(SmartPlace(info, itemKind, smartPlaceOptions, num, pos, z));
                    return true;
                }
                return false;
            }}
            customWiringToolColor={(originPort) => {
                const port = originPort as DigitalPort;
                if (port.group === "inputs")
                    return "#ffffff";
                const signal = info.sim.getSignal(originPort as DigitalPort);
                if (signal === Signal.On)
                    return DEFAULT_ON_COLOR;
                if (signal === Signal.Metastable)
                    return METASTABLE_COLOR;
                return "#ffffff";
            }} />
    );
}
