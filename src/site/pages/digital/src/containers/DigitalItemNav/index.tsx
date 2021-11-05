import {useEffect, useState} from "react";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalEvent} from "digital/models";
import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {DeleteICDataAction} from "digital/actions/DeleteICDataAction";
import {IC} from "digital/models/ioobjects";
import {ICData} from "digital/models/ioobjects";

import {ItemNav, ItemNavItem, ItemNavSection} from "shared/containers/ItemNav";

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
                    icon: "multiplexer.svg",
                    removable: true,
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
        }} onDelete={(sec: ItemNavSection, ic: ItemNavItem) => {
            let designer: DigitalCircuitDesigner = info.designer as DigitalCircuitDesigner;
            let shouldDelete: boolean = true;
            let icIndex: number = +ic.id.substr(ic.id.indexOf('/')+1);

            info.designer.getAll().forEach(function (o) {
                if (o instanceof IC && o.getData() === designer.getICData()[icIndex]){
                    window.alert("Cannot delete this IC while instances remain in the circuit.");
                    shouldDelete = false;
                }
            })
            if(shouldDelete){
                sec.items.splice(sec.items.indexOf(ic));
                info.history.add(new DeleteICDataAction(designer.getICData()[icIndex], designer).execute());
            }
        }}/>;
}
