import {Circuit, Obj, Prop} from "core/public";
import {useCallback}        from "react";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ColorModuleInputField}  from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import {CircuitDesigner} from "shared/circuitdesigner";

import {PropInfoEntry, PropInfoRecord} from "../propinfo/PropInfo";
import {GetPropsWithInfoFor}           from "../propinfo/PropUtils";

import {TextModuleInputField} from "./inputs/TextModuleInputField";


type Props = {
    designer: CircuitDesigner;
    propInfo: PropInfoRecord;
}
export const PropertyModule = ({ designer, propInfo }: Props) => {
    const circuit = designer.circuit;

    // Props is now a record of every key that EVERY object in `objs` has
    //  associated with an array of the values for each object.
    const [props, objs, forceUpdate] = useSelectionProps(
        circuit,
        (o): o is Obj => (true),
        (o) => GetPropsWithInfoFor(o, propInfo),
    );

    if (!props || objs.length === 0)
        return null;

    // Just get first entry's propInfo since the only actual props that will show
    //  are the ones that every object's info has.
    const info0 = propInfo[objs[0].kind];
    if (!info0) {
        console.warn(`Failed to find prop info for ${objs[0].kind}!`);
        return null;
    }

    const isValidInfoEntry = (entry: PropInfoEntry): boolean => (
        entry.type !== "group"
            // Get the info entries that have an associated key in the props
            ? (entry.key in props)
            // Or if they are groups, then make sure that EVERY sub-entry
            //  has their key in the props
            : (entry.info.every(isValidInfoEntry))
    );
    const infoList = info0.filter(isValidInfoEntry);

    // Map each info entry to
    return (<>{infoList.map((entry) => (
        <PropInfoEntryWrapper
            key={entry.id}
            circuit={circuit} entry={entry}
            props={props} objs={objs} forceUpdate={forceUpdate} />
    ))}</>);
}


// Wrapper component for a PropInfoEntry
//  That adds the label for the input field
// Note: That fields/groups without a label will NOT be wrapped in a containing div
const PropInfoEntryWrapper = (allProps: PropInputFieldProps) => {
    const { entry, props } = allProps;

    // Check if this module is active
    const isActive = entry.isActive?.(props) ?? true;
    if (!isActive)
        return null;

    if (!entry.label)
        return (<PropInfoEntryInputField {...allProps} />);

    return (<div>
        <label>{entry.label}</label>
        <PropInfoEntryInputField {...allProps} />
    </div>);
}


type PropInputFieldProps = {
    circuit: Circuit;
    entry: PropInfoEntry;
    props: Record<string, Prop[]>;
    objs: Obj[];
    forceUpdate: () => void;
}
const PropInfoEntryInputField = ({
    circuit, entry, props, objs, forceUpdate,
}: PropInputFieldProps) => {
    const key = (entry.type === "group" ? "" : entry.key);

    // Create doChange callback
    const doChange = useCallback(
        (newVals: Prop[]) => objs.forEach((o, i) => (o.setProp(key, newVals[i]))),
        [key, objs]);

    // If group entry, then return the sub-entries
    if (entry.type === "group") {
        return (<>{
            entry.info.map((subentry) => (
                <PropInfoEntryWrapper
                    key={subentry.id}
                    circuit={circuit} entry={subentry}
                    props={props} objs={objs} forceUpdate={forceUpdate} />
            ))
        }</>);
    }

    // Otherwise get the properties for this entry
    const vals = props[entry.key];

    switch (entry.type) {
        case "float":
        case "int":
            return (
                <NumberModuleInputField
                    circuit={circuit}
                    kind={entry.type} props={vals as number[]}
                    step={entry.step} min={entry.min} max={entry.max}
                    doChange={doChange} />
            );
        case "string":
            return (
                <TextModuleInputField
                    circuit={circuit}
                    props={vals as string[]}
                    doChange={doChange} />
            );
        case "string[]":
            return (
                <SelectModuleInputField
                    circuit={circuit}
                    kind="string[]"
                    props={vals as string[]} options={entry.options}
                    doChange={doChange}
                    onSubmit={() => {
                        // TODO[model_refactor_api](leon) - do we still need this?
                        forceUpdate(); // Need to force update since these can trigger info-state changes
                                    //  and feel less inituitive to the user about focus/blur
                    }} />
            );
        case "color":
            return (
                <ColorModuleInputField
                    circuit={circuit}
                    props={vals as string[]}
                    doChange={doChange} />
            );
    }
}
