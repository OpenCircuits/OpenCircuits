import {GUID}                                      from "shared/api/circuit/public";
import {useCallback, useEffect, useMemo, useState} from "react";

import {useWindowKeyDownEvent} from "shared/site/utils/hooks/useKeyDownEvent";

import {ItemNav, type ItemNavItem, type ItemNavSection} from "shared/site/containers/ItemNav";

import {SmartPlaceOptions} from "digital/site/utils/SmartPlace";

import {useCurDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

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
    const designer = useCurDigitalDesigner();
    const circuit = designer.circuit;
    const [{ ics }, setState] = useState<{ ics: ItemNavItem[] }>({ ics: [] });

    // State for if we should 'Smart Place' (issue #689)
    const [smartPlace, setSmartPlace] = useState(SmartPlaceOptions.Off);

    // Cycle through Smart Place options on Alt key press
    useWindowKeyDownEvent("Alt", () => {
        setSmartPlace((smartPlace) => SmartPlaceOrder[
            // Calculate index of current option and find next one in the list
            (SmartPlaceOrder.indexOf(smartPlace) + 1) % SmartPlaceOrder.length]
        );
    });

    // Subscribe to CircuitDesigner
    //  and update the ItemNav w/
    //  ICs whenever they're added/removed
    useEffect(() => {
        const updateICs = () => setState({
            ics: circuit.getICs().map((d) => ({
                kind:      d.id,
                label:     d.name,
                icon:      "multiplexer.svg",
                removable: true,
            })),
        });

        // Update ICs when circuit changes so importing a circuit also shows the ICs in the item nav
        updateICs();
        return circuit.subscribe((ev) => {
            if (ev.type !== "contents")
                return;
            if (ev.diff.addedICs.size === 0 && ev.diff.removedICs.size === 0)
                return;
            updateICs();
        })
    }, [circuit]);

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

    const additionalPreview = useCallback((smartPlace: SmartPlaceOptions, curItemKind: string) => {
        if (!curItemKind || (smartPlace === SmartPlaceOptions.Off))
            return;

        // This function shows the display for 'Smart Place' (issue #689)
        const { defaultPortConfig: config, inputPortGroups, outputPortGroups } = circuit.getComponentInfo(curItemKind)!;
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

        // Get path within config of ItemNav icon
        const section = config.sections.find((s) => s.items.find((i) => (i.kind === obj.kind)));
        const item = section?.items.find((i) => (i.kind === obj.kind));

        return `${config.imgRoot}/${section!.kind}/${item!.icon}`;
    }, [circuit, config.imgRoot, config.sections]);

    const onSmartPlaceOff = useCallback(() => setSmartPlace(SmartPlaceOptions.Off), [setSmartPlace]);

    const onDelete = useCallback((sec: ItemNavSection, ic: ItemNavItem) => {
        const id = ic.kind;
        if (circuit.getComponents().some(({ kind }) => kind === id)) {
            window.alert("Cannot delete this IC while instances remain in the circuit.");
            return false;
        }
        circuit.deleteIC(id);
        return true;
    }, [circuit, history]);

    // Append regular ItemNav items with ICs
    return (
        <ItemNav
            designer={designer}
            config={config}
            additionalData={smartPlace}
            additionalPreview={additionalPreview}
            getImgSrc={getImgSrc}
            onStart={onSmartPlaceOff}
            onFinish={onSmartPlaceOff}
            onDelete={onDelete} />
    );
}
