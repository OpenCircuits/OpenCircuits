import {Circuit, Obj, Prop} from "shared/api/circuit/public";

import {useSelectionProps} from "shared/site/containers/SelectionPopup/modules/useSelectionProps";

import {ColorModuleInputField}  from "shared/site/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {NumberModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/site/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import {CircuitDesigner} from "shared/api/circuitdesigner/public/CircuitDesigner";

import {PropInfoEntry, PropInfoGetter} from "../propinfo/PropInfo";
import {GetPropsWithInfoFor}           from "../propinfo/PropUtils";

import {TextModuleInputField} from "./inputs/TextModuleInputField";


type Props = {
    designer: CircuitDesigner;
    propInfo: PropInfoGetter;
}
export const PropertyModule = ({ designer, propInfo }: Props) => {
    const circuit = designer.circuit;

    // Props is now a record of every key that EVERY object in `objs` has
    //  associated with an array of the values for each object.
    const [props, objs] = useSelectionProps(
        circuit,
        (o): o is Obj => (true),
        (o) => GetPropsWithInfoFor(o, propInfo),
    );

    if (!props || objs.length === 0)
        return;

    // Just get first entry's propInfo since the only actual props that will show
    //  are the ones that every object's info has.
    const info0 = propInfo(objs[0]);
    if (!info0) {
        console.warn(`Failed to find prop info for ${objs[0].kind}!`);
        return;
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
            props={props} objs={objs} />
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
        return;

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
}
const PropInfoEntryInputField = ({
    circuit, entry, props, objs,
}: PropInputFieldProps) => {
    const key = (entry.type === "group" ? "" : entry.key);

    // Create doChange callback
    // TODO: Do we still need this is a callback since we have React Compiler?
    const doChange = (newVals: Prop[]) => objs.forEach((o, i) => (o.setProp(key, newVals[i])));

    // If group entry, then return the sub-entries
    if (entry.type === "group") {
        return (<>{
            entry.info.map((subentry) => (
                <PropInfoEntryWrapper
                    key={subentry.id}
                    circuit={circuit} entry={subentry}
                    props={props} objs={objs} />
            ))
        }</>);
    }

    // Otherwise get the properties for this entry
    const vals = props[entry.key];

    switch (entry.type) {
        case "float":
        case "int":
            const unit = entry.unit;
            if (!unit) {
                return (
                    <NumberModuleInputField
                        circuit={circuit}
                        kind={entry.type}
                        props={(vals as number[])}
                        step={entry.step} min={entry.min} max={entry.max}
                        transform={entry.transform}
                        doChange={doChange} />
                );
            }

            const unitVals = props[unit.key] as string[];

            return (<div>
                <span style={{ display: "inline-block", width: "70%" }}>
                    <NumberModuleInputField
                        circuit={circuit}
                        kind={entry.type}
                        props={(vals as number[])}
                        step={entry.step} min={entry.min} max={entry.max}
                        transform={entry.transform}
                        doChange={doChange}
                        getCustomDisplayVal={(v) => (`${v}`.length > 4 ? v.toExponential(2) : `${v}`)} />
                </span>
                <span style={{ display: "inline-block", width: "30%" }}>
                    <SelectModuleInputField
                        circuit={circuit}
                        kind="string[]"
                        props={unitVals}
                        options={Object.entries(unit.entries).map(([key, u]) => [u.display, key])}
                        doChange={(newUnits: string[]) => objs.forEach((o, i) => {
                            o.setProp(unit.key, newUnits[i]);
                            // Need to transform prop to new unit
                            o.setProp(key, (vals as number[])[i] * unit.entries[unitVals[i]].scale / unit.entries[newUnits[i]].scale);
                        })} />
                </span>
            </div>)
        case "number[]":
            return (
                <SelectModuleInputField
                    circuit={circuit}
                    kind="number[]"
                    props={vals as number[]} options={entry.options}
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
                    doChange={doChange} />
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
