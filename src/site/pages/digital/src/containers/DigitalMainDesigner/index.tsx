import {useLayoutEffect} from "react";

import {DigitalComponent} from "core/models/types/digital";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

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
            }} />
    );
}
