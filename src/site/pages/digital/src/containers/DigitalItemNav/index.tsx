import {CircuitEvent}                              from "core/controllers/CircuitController";
import {AllPortInfo}                               from "core/views/portinfo";
import {GetConfigAmount}                           from "core/views/portinfo/utils";
import {useCallback, useEffect, useMemo, useState} from "react";

import {GUID} from "core/utils/GUID";

import {AnyComponent, AnyObj} from "core/models/types";

import {DigitalComponent, DigitalPortGroup} from "core/models/types/digital";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";

import {useWindowKeyDownEvent} from "shared/utils/hooks/useKeyDownEvent";

import {ItemNav, ItemNavItem} from "shared/containers/ItemNav";

import {SmartPlaceOptions} from "site/digital/utils/DigitalCreate";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


/**
 * Utility function to get the number of input ports and output ports
 *  that a given DigitalComponent has from the ID of the component.
 * This is used for the `Smart Place` feature (see below) to know how
 *  many Switches and LEDs to show.
 *
 * @param itemKind The kind of digital component.
 * @param info     The Digital Circuit Info.
 * @returns        A tuple of [numInputs, numOutputs].
 */
function GetNumInputsAndOutputs(itemKind: AnyComponent["kind"], info: DigitalCircuitInfo): [number, number] {
    // if (itemId.startsWith("ic")) {
    //     const [_, idx] = itemId.split("/");
    //     const icData = info.designer.getICData()[parseInt(idx)];
    //     return [icData.getInputCount(), icData.getOutputCount()];
    // }

    const portConfig = AllPortInfo[itemKind].InitialConfig;
    return [
        GetConfigAmount(portConfig, DigitalPortGroup.Input) + GetConfigAmount(portConfig, DigitalPortGroup.Select),
        GetConfigAmount(portConfig, DigitalPortGroup.Output),
    ];
}

// List that represents the order of smart place options cycle
const SmartPlaceOrder = [
    SmartPlaceOptions.Off,
    SmartPlaceOptions.Full,
    SmartPlaceOptions.Outputs,
    SmartPlaceOptions.Inputs,
];

// type ICID = `ic/${number}`;


type Props = {
    info: DigitalCircuitInfo;
}
export const DigitalItemNav = ({ info }: Props) => {
    const { circuit, history } = info;
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
        const onEvent = (ev: CircuitEvent<AnyObj>) => {
            if (ev.type !== "ic")
                return;
            // TOOD:
            // setState({
            //     ics: circuit.getICData().map((d, i) => ({
            //         id:        `ic/${i}` as ICID,
            //         label:     d.getName(),
            //         icon:      "multiplexer.svg",
            //         removable: true,
            //     })),
            // });
        }

        circuit.subscribe(onEvent);
        return () => circuit.unsubscribe(onEvent);
    }, [circuit]);

    // Generate ItemNavConfig with ICs included
    const config = useMemo(() => ({
        imgRoot:  itemNavConfig.imgRoot,
        sections: [
            ...itemNavConfig.sections,
            // ...(ics.length === 0 ? [] : [{
            //     id:    "other",
            //     label: "ICs",
            //     items: ics,
            // }]),
        ],
    }), [ics]);

    const additionalPreview = useCallback((smartPlace: SmartPlaceOptions, curItemID: DigitalComponent["kind"]) => {
        if (!curItemID || (smartPlace === SmartPlaceOptions.Off))
            return;

        // This function shows the display for 'Smart Place' (issue #689)
        const [numInputs, numOutputs] = GetNumInputsAndOutputs(curItemID, info);
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
    const getImgSrc = useCallback((id: GUID) => {
        const obj = info.circuit.getObj(id);
        if (!obj)
            throw new Error(`DigitalItemNav: Failed to find object with ID ${id}!`);
        // // Get ID
        // const id = (c instanceof IC)
        //     // IC config 'id' is based on index of its ICData
        //     ? (`ic/${designer.getICData().indexOf(c.getData())}`)
        //     // Otherwise just get the Serialized ID
        //     : (GetIDFor(c));
        // if (!id)
        //     throw new Error(`DigitalItemNav: Can't find ID for component ${c.getName()}`);

        // Get path within config of ItemNav icon
        const section = config.sections.find((s) => s.items.find((i) => (i.kind === obj.kind)));
        const item = section?.items.find((i) => (i.kind === obj.kind));

        return `${config.imgRoot}/${section!.kind}/${item!.icon}`;
    }, [config.imgRoot, config.sections, info]);

    const onSmartPlaceOff = useCallback(() => setSmartPlace(SmartPlaceOptions.Off), [setSmartPlace]);

    // const onDelete = useCallback((sec: ItemNavSection, ic: ItemNavItem) => {
    //     const id = ic.id as ICID;
    //     const icData = designer.getICData()[parseInt(id.split("/")[1])];
    //     if (IsICDataInUse(designer, icData)) {
    //         window.alert("Cannot delete this IC while instances remain in the circuit.");
    //         return false;
    //     }
    //     sec.items.splice(sec.items.indexOf(ic));
    //     history.add(RemoveICData(icData, designer));
    //     return true;
    // }, [designer, history]);

    // Append regular ItemNav items with ICs
    return (
        <ItemNav
            info={info}
            config={config}
            additionalData={smartPlace}
            additionalPreview={additionalPreview}
            getImgSrc={getImgSrc}
            onStart={onSmartPlaceOff}
            onFinish={onSmartPlaceOff} />
            // onDelete={onDelete} />
    );
}
