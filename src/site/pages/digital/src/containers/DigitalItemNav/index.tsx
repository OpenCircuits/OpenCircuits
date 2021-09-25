import {useEffect, useState} from "react";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalEvent} from "digital/models";

import {ItemNav, ItemNavItem} from "shared/containers/ItemNav";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


type Props = {
    info: DigitalCircuitInfo;
}
export const DigitalItemNav = ({info}: Props) => {
    const {designer} = info;
    const [{ics}, setState] = useState({ ics: [] as ItemNavItem[] });

    useEffect(() => {
        // Subscribe to CircuitDesigner
        //  and update the ItemNav w/
        //  ICs whenever they're added/removed
        const onEvent = (ev: DigitalEvent) => {
            if (ev.type !== "ic")
                return;
            setState({
                ics: designer.getICData().map((d, i) => ({
                    id: `ic/${i}`,
                    label: d.getName(),
                    icon: "multiplexer.svg"
                }))
            });
        }

        designer.addCallback(onEvent);
        return () => designer.removeCallback(onEvent);
    }, [designer]);

    // Append regular ItemNav items with ICs
    return <ItemNav info={info} config={{
        imgRoot: itemNavConfig.imgRoot,
        sections: [
            ...itemNavConfig.sections,
            ...(ics.length === 0 ? [] : [{
                id: "other",
                label: "ICs",
                items: ics
            }])
        ]
    }} />;
}
