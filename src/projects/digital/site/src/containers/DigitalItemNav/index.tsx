import {GUID}                                      from "shared/api/circuit/public";
import {useCallback, useEffect, useMemo, useState} from "react";

import {useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";

import {ItemNav, type ItemNavItem} from "shared/site/containers/ItemNav";

import {SmartPlaceOptions} from "digital/site/utils/DigitalCreate";

import {useMainDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

import itemNavConfig from "digital/site/data/itemNavConfig.json";

import "shared/api/circuit/utils/Array";


// List that represents the order of smart place options cycle
const SmartPlaceOrder = [
    SmartPlaceOptions.Off,
    SmartPlaceOptions.Full,
    SmartPlaceOptions.Outputs,
    SmartPlaceOptions.Inputs,
];

// type ICID = `ic/${number}`;

export const DigitalItemNav = () => {
    const designer = useMainDigitalDesigner();
    const circuit = designer.circuit;
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

    // // Subscribe to CircuitDesigner
    // //  and update the ItemNav w/
    // //  ICs whenever they're added/removed
    // useEffect(() => designer.subscribe((ev) => {
    //     if (ev.type !== "ic")
    //         return;
    //     // TODO:
    //     // setState({
    //     //     ics: circuit.getICData().map((d, i) => ({
    //     //         id:        `ic/${i}` as ICID,
    //     //         label:     d.getName(),
    //     //         icon:      "multiplexer.svg",
    //     //         removable: true,
    //     //     })),
    //     // });
    // }));

    // Generate ItemNavConfig with ICs included
    const config = useMemo(() => ({
        imgRoot:  itemNavConfig.imgRoot,
        sections: [
            ...itemNavConfig.sections,
            ...(ics.length === 0 ? [] : [{
                kind:  "other",
                label: "ICs",
                items: ics,
            }]),
        ],
    }), [ics]);

    const additionalPreview = useCallback((smartPlace: SmartPlaceOptions, curItemID: string) => {
        if (!curItemID || (smartPlace === SmartPlaceOptions.Off))
            return;

        // This function shows the display for 'Smart Place' (issue #689)
        const { defaultPortConfig: config, inputPortGroups, outputPortGroups } = circuit.getComponentInfo(curItemID)!;
        const numInputPorts  = inputPortGroups .map((g) => config[g]).sum();
        const numOutputPorts = outputPortGroups.map((g) => config[g]).sum();
        return (<>
            {!!(smartPlace & SmartPlaceOptions.Inputs) &&
                new Array(numInputPorts).fill(0).map((_, i) => (
                    // Show the Switches
                    <img key={`digital-itemnav-inputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/inputs/switch.svg`}
                         width="80px" height="80px"
                         alt="Switch"
                         style={{
                             position: "absolute",
                             left:     -100,
                             top:      80*(i - (numInputPorts-1)/2),
                         }} />
                ))}
            {!!(smartPlace & SmartPlaceOptions.Outputs) &&
                new Array(numOutputPorts).fill(0).map((_, i) => (
                    // Show the LEDs
                    <img key={`digital-itemnav-outputs-${i}`}
                         src={`/${itemNavConfig.imgRoot}/outputs/led.svg`}
                         width="80px" height="80px"
                         alt="Switch"
                         style={{
                             position: "absolute",
                             left:     100,
                             top:      90*(i - (numOutputPorts-1)/2),
                         }} />
                ))}
        </>)
    }, [circuit]);

    // Callbacks
    const getImgSrc = useCallback((id: GUID) => {
        const obj = circuit.getObj(id);
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
    }, [circuit, config.imgRoot, config.sections]);

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
            designer={designer}
            config={config}
            additionalData={smartPlace}
            additionalPreview={additionalPreview}
            getImgSrc={getImgSrc}
            onStart={onSmartPlaceOff}
            onFinish={onSmartPlaceOff} />
            // onDelete={onDelete} />
    );
}
