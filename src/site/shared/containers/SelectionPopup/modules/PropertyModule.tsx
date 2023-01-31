import {Circuit, Obj, Prop} from "core/public";

import {RecordOfArrays, useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ColorModuleInputField}  from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {ModuleSubmitInfo}       from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import {TextModuleInputField} from "./inputs/TextModuleInputField";


type PropInputFieldProps = {
    circuit: Circuit;
    entry: PropInfoEntry<AnyObj>;
    props: RecordOfArrays<AnyObj>;
    objs: Obj[];
    forceUpdate: () => void;
}
const PropInfoEntryInputField = ({
    circuit, entry, props, objs, forceUpdate,
}: PropInputFieldProps) => {
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

    // Create getAction and onSubmit callbacks
    const getAction = (newVals: Prop[]) => new GroupAction(
        objs.map((o,i) => SetProperty(info.circuit, o.id, entry.key, newVals[i]))
    );
    const onSubmit = ({ isFinal, action }: ModuleSubmitInfo) => {
        info.renderer.render();
        if (isFinal)
            info.history.add(action);
    };

    switch (entry.type) {
        case "float":
        case "int":
            return (
                <NumberModuleInputField
                    kind={entry.type} props={vals as number[]}
                    step={entry.step} min={entry.min} max={entry.max}
                    getAction={getAction} onSubmit={onSubmit} />
            );
        case "string":
            return (
                <TextModuleInputField
                    props={vals as string[]}
                    getAction={getAction} onSubmit={onSubmit} />
            );
        case "string[]":
            return (
                <SelectModuleInputField
                    kind="string[]"
                    props={vals as string[]} options={entry.options}
                    getAction={getAction}
                    onSubmit={(i) => {
                        onSubmit(i);
                        forceUpdate(); // Need to force update since these can trigger info-state changes
                                       //  and feel less inituitive to the user about focus/blur
                    }} />
            );
        case "color":
            return (
                <ColorModuleInputField
                    props={vals as string[]}
                    getAction={getAction} onSubmit={onSubmit} />
            );
        default:
            throw new Error(`Unknown Property Type: ${entry.type}!`);
    }
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


type Props = {
    circuit: Circuit;
}
export const PropertyModule = ({ circuit }: Props) => {
    // Props is now a record of every key that EVERY object in `objs` has
    //  associated with an array of the values for each object.
    const [props, objs, forceUpdate] = useSelectionProps(
        circuit,
        (o): o is Obj => (true),
        (o) => o.getProps(),
    );

    if (!props)
        return null;

    // Just get first entry's propInfo since the only actual props that will show
    //  are the ones that every object's info has.
    const info0 = propInfo[objs[0].kind as Obj["kind"]] as PropInfo<Obj>;

    const isValidInfoEntry = (entry: PropInfoEntry<Obj>): boolean => (
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

