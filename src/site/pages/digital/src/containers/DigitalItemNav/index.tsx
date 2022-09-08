import {useCallback, useEffect, useMemo, useState} from "react";
import {Create, GetIDFor}                          from "serialeazy";

import {Component} from "core/models";

import {IsICDataInUse}      from "digital/utils/ComponentUtils";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {RemoveICData} from "digital/actions/units/AddICData";

import {DigitalComponent, DigitalEvent, InputPort, OutputPort} from "digital/models";

import {IC} from "digital/models/ioobjects";

import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {ItemNav, ItemNavItem, ItemNavSection} from "shared/containers/ItemNav";

import {SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


/**
 * Utility function to get the number of input ports and output ports
 *  that a given DigitalComponent has from the ID of the component.
 * This is used for the `Smart Place` feature (see below) to know how
 *  many Switches and LEDs to show.
 *
 * @param itemId ID of a digital component.
 * @param info   The Digital Circuit Info.
 * @returns        A tuple of [numInputs, numOutputs].
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
        component.getPorts().filter((p) => p instanceof InputPort).length,
        component.getPorts().filter((p) => p instanceof OutputPort).length,
    ];
}

// List that represents the order of smart place options cycle
const SmartPlaceOrder = [
    SmartPlaceOptions.Off,
    SmartPlaceOptions.Full,
    SmartPlaceOptions.Outputs,
    SmartPlaceOptions.Inputs,
];

type ICID = `ic/${number}`;


type Props = {
    info: DigitalCircuitInfo;
}
export const DigitalItemNav = ({ info }: Props) => {
    const { designer, history } = info;
    const [{ ics }, setState] = useState({ ics: [] as ItemNavItem[] });

    // State for if we should 'Smart Place' (issue #689)
    const [smartPlace, setSmartPlace] = useState(SmartPlaceOptions.Off);

    // Cycle through Smart Place options on Alt key press
    useWindowKeyDownEvent("Alt", () => {
        setSmartPlace((smartPlace) => SmartPlaceOrder[
            // Calculate index of current option and find next one in the list
            (SmartPlaceOrder.indexOf(smartPlace) + 1) % SmartPlaceOrder.length]
        );
    });

    useEffect(() => {
        // Subscribe to CircuitDesigner
        //  and update the ItemNav w/
        //  ICs whenever they're added/removed
        const onEvent = (ev: DigitalEvent) => {
            if (ev.type !== "ic")
                return;
            setState({
                ics: designer.getICData().map((d, i) => ({
                    id:        `ic/${i}` as ICID,
                    label:     d.getName(),
                    icon:      "multiplexer.svg",
                    removable: true,
                })),
            });
        }

        designer.addCallback(onEvent);
        return () => designer.removeCallback(onEvent);
    }, [designer]);

    // Generate ItemNavConfig with ICs included
    const config = useMemo(() => ({
        imgRoot:  itemNavConfig.imgRoot,
        sections: [
            ...itemNavConfig.sections,
            ...(ics.length === 0 ? [] : [{
                id:    "other",
                label: "ICs",
                items: ics,
            }]),
        ],
    }), [ics]);

    const additionalPreview = useCallback((smartPlace: SmartPlaceOptions, curItemId: string) => {
        if (!curItemId || (smartPlace === SmartPlaceOptions.Off))
            return;

        // This function shows the display for 'Smart Place' (issue #689)
        const [numInputs, numOutputs] = GetNumInputsAndOutputs(curItemId, info);
        return (<>
            {!!(smartPlace & SmartPlaceOptions.Inputs) &&
                new Array(numInputs).fill(0).map((_, i) => (
                    // Show the Switches
                    <img key={`digital-itemnav-inputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/inputs/switch.svg`}
                         width="80px" height="80px"
                         alt="Switch"
                         style={{
                             position: "absolute",
                             left:     -100,
                             top:      80*(i - (numInputs-1)/2),
                         }} />
                ))}
            {!!(smartPlace & SmartPlaceOptions.Outputs) &&
                new Array(numOutputs).fill(0).map((_, i) => (
                    // Show the LEDs
                    <img key={`digital-itemnav-outputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/outputs/led.svg`}
                         width="80px" height="80px"
                         alt="Switch"
                         style={{
                             position: "absolute",
                             left:     100,
                             top:      90*(i - (numOutputs-1)/2),
                         }} />
                ))}
        </>)
    }, [info]);

    // Callbacks
    const getImgSrc = useCallback((c: Component) => {
        // Get ID
        const id = (c instanceof IC)
            // IC config 'id' is based on index of its ICData
            ? (`ic/${designer.getICData().indexOf(c.getData())}`)
            // Otherwise just get the Serialized ID
            : (GetIDFor(c));
        if (!id)
            throw new Error(`DigitalItemNav: Can't find ID for component ${c.getName()}`);

        // Get path within config of ItemNav icon
        const section = config.sections.find((s) => s.items.find((i) => (i.id === id)));
        const item = section?.items.find((i) => (i.id === id));

        return `${config.imgRoot}/${section?.id}/${item?.icon}`;
    }, [config.imgRoot, config.sections, designer]);

    const onSmartPlaceOff = useCallback(() => setSmartPlace(SmartPlaceOptions.Off), [setSmartPlace]);

    const onDelete = useCallback((sec: ItemNavSection, ic: ItemNavItem) => {
        const id = ic.id as ICID;
        const icData = designer.getICData()[parseInt(id.split("/")[1])];
        if (IsICDataInUse(designer, icData)) {
            window.alert("Cannot delete this IC while instances remain in the circuit.");
            return false;
        }
        sec.items.splice(sec.items.indexOf(ic));
        history.add(RemoveICData(icData, designer));
        return true;
    }, [designer, history]);

    // Append regular ItemNav items with ICs
    return (
        <ItemNav
            info={info}
            config={config}
            additionalData={smartPlace}
            additionalPreview={additionalPreview}
            getImgSrc={getImgSrc}
            onStart={onSmartPlaceOff}
            onFinish={onSmartPlaceOff}
            onDelete={onDelete} />
    );
}
