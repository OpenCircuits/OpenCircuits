import {Action} from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {SetPropertyAction} from "analog/actions/SetPropertyAction";

import {AnalogComponent} from "analog/models";
import {Prop, PropInfo} from "analog/models/AnalogComponent";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {TextModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/TextModuleInputField";
import {ColorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";
import {ModuleSubmitInfo} from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";


type PropInputFieldProps = {
    propKey: string;
    info: PropInfo;

    cs: AnalogComponent[];

    vals: string[] | number[] | boolean[];

    alt?: string;

    forceUpdate: () => void;
    getAction: (newVal: Prop) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
}
const ModulePropInputField = ({ propKey, info, cs, vals, forceUpdate, ...otherProps }: PropInputFieldProps) => {
    const { type } = info;

    switch (type) {
    case "string":
        return <TextModuleInputField {...otherProps} props={vals as string[]} />
    case "color":
        return <ColorModuleInputField {...otherProps} props={vals as string[]} />
    case "number[]":
    case "string[]":
        return <SelectModuleInputField {...otherProps}
                    kind={type} props={vals as string[] | number[]} options={info.options}
                    onSubmit={(info) => {
                        otherProps.onSubmit(info);
                        forceUpdate(); // Need to force update since these can trigger info-state changes
                                       //  and feel less inituitive to the user about focus/blur
                    }} />
    case "int":
    case "float":
        const unit = info.unit;
        if (!unit) {
            return <NumberModuleInputField {...otherProps}
                        min={info.min} max={info.max} step={info.step}
                        props={vals as number[]} />
        }

        const units = vals.map((_, i) => cs[i].getProp(`${propKey}_U`)) as string[];
        const transformedVals = vals.map((v, i) => (v as number) / unit[units[i]].val);

        // val is ALWAYS the unit value, and gets transformed on UI-end to unit-full value
        return <div>
            <span style={{ display: "inline-block", width: "70%" }}>
                <NumberModuleInputField {...otherProps}
                    min={info.min} max={info.max} step={info.step}
                    getAction={(newVal) => otherProps.getAction(newVal * unit[units[0]].val)}
                    props={transformedVals} />
            </span>
            <span style={{ display: "inline-block", width: "30%" }}>
                <SelectModuleInputField {...otherProps}
                    kind="string[]" props={units}
                    options={Object.entries(unit).map(([key, u]) => [u.display, key])}
                    onSubmit={(info) => {
                        otherProps.onSubmit(info);
                        forceUpdate(); // Need to force update since these can trigger info-state changes
                                       //  and feel less inituitive to the user about focus/blur
                    }}
                    getAction={(newVal) => new GroupAction(
                        cs.map(a => new SetPropertyAction(a, `${propKey}_U`, newVal))
                    )} />
            </span>
        </div>
    }
}


type Props = {
    info: AnalogCircuitInfo;
}
export const PropertyModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs, forceUpdate] = useSelectionProps(
        info,
        (s): s is AnalogComponent => (s instanceof AnalogComponent),
        (s) => s.getProps(),
    );

    if (!props)
        return null;

    return <>{Object.entries(props).map(([key, vals]) => {
        // Assumes all Info's are the same for each key
        const info = cs[0].getPropInfo(key);
        if (!info)
            throw new Error(`Failed to get prop info for ${key}!`);

        // Check if this property should be active, if the info defines an `isActive`
        //  function, then we need to make sure all components satisfy it
        const isActive = (info.isActive) ? (cs.every(a => info.isActive!(a.getProps()))) : (true);
        if (!isActive)
            return null;

        const display = (
            typeof info.display === "string"
            ? info.display
            // For now just take 1st component state for display
            //  TODO: Maybe improve this
            : info.display(cs[0].getProps())
        );

        return <div key={`property-module-${key}`}>
            {display}
            <label>
            { info.readonly
                ? ((vals as Prop[]).every(v => v === vals[0]) ? vals[0] : "-")
                : <ModulePropInputField
                    propKey={key} info={info} cs={cs} vals={vals} forceUpdate={forceUpdate}
                    getAction={(newVal) => new GroupAction(
                        cs.map(a => new SetPropertyAction(a, key, newVal))
                    )}
                    onSubmit={(info) => {
                        renderer.render();
                        if (info.isValid && info.isFinal)
                            history.add(info.action);
                    }}
                    alt={`${display} property of object`} /> }
            </label>
        </div>;
    })}</>
}
