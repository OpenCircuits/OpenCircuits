import {V, Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action}            from "core/actions/Action";
import {GroupAction}       from "core/actions/GroupAction";
import {SetPropertyAction} from "core/actions/SetPropertyAction";

import {Component} from "core/models";

import {Prop, PropInfo} from "core/models/PropInfo";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ButtonModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ButtonModuleInputField";
import {ColorModuleInputField}  from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {ModuleSubmitInfo}       from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";
import {TextModuleInputField}   from "shared/containers/SelectionPopup/modules/inputs/TextModuleInputField";


type PropInputFieldProps = {
    propKey: string;
    info: PropInfo;

    cs: Component[];

    vals: string[] | number[] | Vector[] | boolean[];

    alt?: string;

    forceUpdate: () => void;
    getAction: (newVal: Prop) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
}
const ModulePropInputField = ({
    propKey, info, cs, vals, forceUpdate, ...otherProps
}: PropInputFieldProps) => {
    const { type } = info;

    switch (type) {
    case "button":
        return (
            <ButtonModuleInputField
                {...otherProps}
                props={vals as Array<string | number | boolean>}
                getText={info.getText} getNewState={info.getNewState} />
        );
    case "boolean":
        return null; // TODO
    case "string":
        return <TextModuleInputField {...otherProps} props={vals as string[]} />
    case "color":
        return <ColorModuleInputField {...otherProps} props={vals as string[]} />
    case "number[]":
    case "string[]":
        return (
            <SelectModuleInputField
                {...otherProps}
                kind={type} props={vals as string[] | number[]} options={info.options}
                onSubmit={(info) => {
                    otherProps.onSubmit(info);
                    forceUpdate(); // Need to force update since these can trigger info-state changes
                                   //  and feel less inituitive to the user about focus/blur
                }} />
        );
    case "int":
    case "float":
        const unit = info.unit;
        if (!unit) {
            return (
                <NumberModuleInputField
                    {...otherProps}
                    kind={type} min={info.min} max={info.max} step={info.step}
                    props={vals as number[]} />
            );
        }

        const units = vals.map((_, i) => cs[i].getProp(`${propKey}_U`)) as string[];
        const transformedVals = vals.map((v, i) => (v as number) / unit[units[i]].val);

        // val is ALWAYS the unit value, and gets transformed on UI-end to unit-full value
        return (<div>
            <span style={{ display: "inline-block", width: "70%" }}>
                <NumberModuleInputField
                    {...otherProps}
                    kind={type} min={info.min} max={info.max} step={info.step}
                    getAction={(newVal) => otherProps.getAction(newVal * unit[units[0]].val)}
                    props={transformedVals} />
            </span>
            <span style={{ display: "inline-block", width: "30%" }}>
                <SelectModuleInputField
                    {...otherProps}
                    kind="string[]" props={units}
                    options={Object.entries(unit).map(([key, u]) => [u.display, key])}
                    getAction={(newVal) => new GroupAction(
                        cs.map(a => new SetPropertyAction(a, `${propKey}_U`, newVal))
                    )}
                    onSubmit={(info) => {
                        otherProps.onSubmit(info);
                        forceUpdate(); // Need to force update since these can trigger info-state changes
                                       //  and feel less inituitive to the user about focus/blur
                    }} />
            </span>
        </div>);
    case "veci":
    case "vecf":
        const kind = (type === "veci" ? "int" : "float");
        const vvals = vals as Vector[];
        return (<>
            <NumberModuleInputField
                {...otherProps}
                kind={kind} min={info.min?.x} max={info.max?.x} step={info.step?.x}
                props={vvals.map(v => v.x)}
                getAction={(newVal) => new GroupAction(
                    cs.map((a,i) => new SetPropertyAction(a, propKey, V(newVal, vvals[i].y)))
                )} />
            <NumberModuleInputField
                {...otherProps}
                kind={kind} min={info.min?.y} max={info.max?.y} step={info.step?.y}
                props={vvals.map(v => v.y)}
                getAction={(newVal) => new GroupAction(
                    cs.map((a,i) => new SetPropertyAction(a, propKey, V(vvals[i].x, newVal)))
                )} />
        </>);
    }
}


type PropertyModuleWrapperProps = {
    label?: string;

    children: React.ReactNode;
}
const PropertyModuleWrapper = ({ label, children }: PropertyModuleWrapperProps) => {
    if (!label)
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;

    return (<div>
        {label}
        <label>
            {children}
        </label>
    </div>);
}


type Props = {
    info: CircuitInfo;
}
export const PropertyModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs, forceUpdate] = useSelectionProps(
        info,
        (s): s is Component => (s instanceof Component),
        (s) => s.getProps(),
    );

    if (!props)
        return null;

    return (<>{Object.entries(props).map(([key, vals]) => {
        // Assumes all Info's are the same for each key
        const info = cs[0].getPropInfo(key);
        if (!info)
            throw new Error(`Failed to get prop info for ${key}!`);

        // Get state of props
        const allProps = cs.map(c => c.getProps());

        // Check if this property should be active, if the info defines an `isActive`
        //  function, then we need to make sure all components satisfy it
        const isActive = (info.isActive) ? (info.isActive(allProps)) : (true);
        if (!isActive)
            return null;

        const label = (
            typeof info.label === "string"
            ? info.label
            : info.label?.(allProps) // Dynamic display based on prop states
        );

        const getAction = (newVal: Prop) => new GroupAction(
            cs.map(a => new SetPropertyAction(a, key, newVal))
        );
        const onSubmit = (info: ModuleSubmitInfo) => {
            renderer.render();
            if (info.isValid && info.isFinal)
                history.add(info.action);
        }

        return (
            <PropertyModuleWrapper
                key={`property-module-${key}`}
                label={label}>
                { info.readonly
                ? ((vals as Prop[]).every(v => v === vals[0]) ? vals[0].toString() : "-")
                : (
                    <ModulePropInputField
                        propKey={key} info={info} cs={cs} vals={vals}
                        forceUpdate={forceUpdate}
                        alt={`${key} property of object`}
                        getAction={getAction}
                        onSubmit={onSubmit} />
                )}
            </PropertyModuleWrapper>
        )
    })}</>)
}
