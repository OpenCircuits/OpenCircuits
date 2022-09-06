import {useCallback} from "react";
import {GetIDFor}    from "serialeazy";

import {Component} from "core/models";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {ItemNav} from "shared/containers/ItemNav";

import itemNavConfig from "site/analog/data/itemNavConfig.json";


type Props = {
    info: AnalogCircuitInfo;
}
export const AnalogItemNav = ({ info }: Props) => {
    const getImgSrc = useCallback((c: Component) => {
        // Get ID
        const id = GetIDFor(c);
        if (!id)
            throw new Error(`AnalogItemNav: Can't find ID for component ${c.getName()}`);

        // Get path within config of ItemNav icon
        const section = itemNavConfig.sections.find((s) => (s.items.find((i) => i.id === id)));
        const item = section?.items.find((i) => (i.id === id));

        return `${itemNavConfig.imgRoot}/${section?.id}/${item?.icon}`;
    }, []);

    return (
        <ItemNav
            info={info}
            config={itemNavConfig}
            getImgSrc={getImgSrc} />
    );
}
