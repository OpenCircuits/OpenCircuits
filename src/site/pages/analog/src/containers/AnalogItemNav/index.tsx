import {useCallback} from "react";

import {GUID} from "core/utils/GUID";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {ItemNav} from "shared/containers/ItemNav";

import itemNavConfig from "site/analog/data/itemNavConfig.json";


type Props = {
    info: AnalogCircuitInfo;
}
export const AnalogItemNav = ({ info }: Props) => {
    const getImgSrc = useCallback((id: GUID) => {
        const obj = info.circuit.getObj(id);
        if (!obj)
            throw new Error(`AnalogItemNav: Failed to find object with ID ${id}!`);

        // Get path within config of ItemNav icon
        const section = itemNavConfig.sections.find((s) => (s.items.find((i) => (i.kind === obj.kind))));
        const item = section?.items.find((i) => (i.kind === obj.kind));

        return `${itemNavConfig.imgRoot}/${section?.kind}/${item?.icon}`;
    }, []);

    return (
        <ItemNav
            info={info}
            config={itemNavConfig}
            getImgSrc={getImgSrc} />
    );
}
