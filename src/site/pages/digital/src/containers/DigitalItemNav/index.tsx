import {Create} from "serialeazy";
import {useEffect, useState} from "react";

import {OPTION_KEY} from "core/utils/Constants";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {DigitalComponent, DigitalEvent, InputPort, OutputPort} from "digital/models";

import {useKey} from "shared/utils/hooks/useKey";
import {ItemNav, ItemNavItem} from "shared/containers/ItemNav";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


/**
 * Utility function to get the number of input ports and output ports
 *  that a given DigitalComponent has from the ID of the component.
 * This is used for the `Smart Place` feature (see below) to know how
 *  many Switches and LEDs to show
 *
 * @param itemId ID of a digital component
 * @param info The Digital Circuit Info
 * @returns A tuple of [numInputs, numOutputs]
 */
function GetNumInputsAndOutputs(itemId: string, info: DigitalCircuitInfo): [number, number] {
    if (itemId.startsWith("ic")) {
        const [_, idx] = itemId.split("/");
        const icData = info.designer.getICData()[parseInt(idx)];
        return [icData.getInputCount(), icData.getOutputCount()];
    }

    const component = Create<DigitalComponent>(itemId);
    return [
        // Need to do it like this rather then comp.getInputPorts() since this can
        //  account for things like the Select ports on Multiplexers
        component.getPorts().filter(p => p instanceof InputPort).length,
        component.getPorts().filter(p => p instanceof OutputPort).length,
    ];
}


type Props = {
    info: DigitalCircuitInfo;
}
export const DigitalItemNav = ({info}: Props) => {
    const {designer} = info;
    const [{ics}, setState] = useState({ ics: [] as ItemNavItem[] });

    // State for if we should 'Smart Place' (issue #689)
    const smartPlace = useKey(OPTION_KEY);

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
        }}
        additionalData={smartPlace}
        additionalPreview={(smartPlace, curItemId) => {
            if (!curItemId || !smartPlace)
                return undefined;

            // This function shows the display for 'Smart Place' (issue #689)
            const [numInputs, numOutputs] = GetNumInputsAndOutputs(curItemId, info);
            return <>
                {Array(numInputs).fill(0).map((_, i) => (
                    // Show the Switches
                    <img key={`digital-itemnav-inputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/inputs/switch.svg`}
                         width="80px" height="80px"
                         style={{
                             position: "absolute",
                             left: -100,
                             top: 80*(i - (numInputs-1)/2),
                         }} />
                ))}
                {Array(numOutputs).fill(0).map((_, i) => (
                    // Show the LEDs
                    <img key={`digital-itemnav-outputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/outputs/led.svg`}
                         width="80px" height="80px"
                         style={{
                             position: "absolute",
                             left: 100,
                             top: 90*(i - (numOutputs-1)/2),
                         }} />
                ))}
            </>
        }}
    />;
}
