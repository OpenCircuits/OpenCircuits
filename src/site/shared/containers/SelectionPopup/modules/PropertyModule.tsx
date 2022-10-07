import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {Action}      from "core/actions/Action";
import {GroupAction} from "core/actions/GroupAction";

import {SetProperty} from "core/actions/units/SetProperty";

import {IOObject} from "core/models";

import {Prop, PropInfo} from "core/models/PropInfo";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {ButtonModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ButtonModuleInputField";
import {ColorModuleInputField}  from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {ModuleSubmitInfo}       from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";
import {TextModuleInputField}   from "shared/containers/SelectionPopup/modules/inputs/TextModuleInputField";
import {VectorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/VectorModuleInputField";


type PropInputFieldProps = {
    propKey: string;
    info: PropInfo;

    objs: IOObject[];

    vals: string[] | number[] | Vector[] | boolean[];

    alt?: string;

    forceUpdate: () => void;
    getAction: (newVals: Prop[]) => Action;
    onSubmit: (info: ModuleSubmitInfo) => void;
}
const ModulePropInputField = ({
    propKey, info, objs, vals, forceUpdate, ...otherProps
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

        const units = vals.map((_, i) => objs[i].getProp(`${propKey}_U`)) as string[];
        const transformedVals = vals.map((v, i) => (v as number) / unit[units[i]].val);

        // val is ALWAYS the unit value, and gets transformed on UI-end to unit-full value
        return (<div>
            <span style={{ display: "inline-block", width: "70%" }}>
                <NumberModuleInputField
                    {...otherProps}
                    kind={type} min={info.min} max={info.max} step={info.step}
                    props={transformedVals}
                    getAction={(newVals) => (
                        // Scale new value by the current unit
                        otherProps.getAction(newVals.map((v) => (v * unit[units[0]].val)))
                    )} />
            </span>
            <span style={{ display: "inline-block", width: "30%" }}>
                <SelectModuleInputField
                    {...otherProps}
                    kind="string[]" props={units}
                    options={Object.entries(unit).map(([key, u]) => [u.display, key])}
                    getAction={(newVals) => new GroupAction(
                        objs.map((a,i) => SetProperty(a, `${propKey}_U`, newVals[i]))
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
        return (
            <VectorModuleInputField
                {...otherProps}
                kind={kind} min={info.min} max={info.max} step={info.step}
                props={vvals}
                getAction={(vals) => new GroupAction(
                    objs.map((a,i) => SetProperty(a, propKey, vals[i]))
                )} />
        );
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

    const [props, objs, forceUpdate] = useSelectionProps(
        info,
        (s): s is IOObject => (s instanceof IOObject),
        (s) => s.getProps(),
    );

    if (!props)
        return null;

    return (<>{Object.entries(props)
        // Filter out props that are without info, since they are private
        .filter(([key]) => (!!objs[0].getPropInfo(key)))
        .map(([key, vals]) => {
            // Assumes all Info's are the same for each key
            const info = objs[0].getPropInfo(key);
            if (!info)
                throw new Error(`Failed to get prop info for ${key}!`);

            // Get state of props
            const allProps = objs.map((c) => c.getProps());

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

            const getAction = (newVals: Prop[]) => new GroupAction(
                objs.map((a,i) => SetProperty(a, key, newVals[i]))
            );
            const onSubmit = ({ isFinal, action }: ModuleSubmitInfo) => {
                renderer.render();
                if (isFinal)
                    history.add(action);
            }

            return (
                <PropertyModuleWrapper
                    key={`property-module-${key}`}
                    label={label}>
                    { info.readonly
                    ? ((vals as Prop[]).every((v) => v === vals[0]) ? vals[0].toString() : "-")
                    : (
                        <ModulePropInputField
                            propKey={key} info={info} objs={objs} vals={vals}
                            forceUpdate={forceUpdate}
                            alt={`${key} property of object`}
                            getAction={getAction}
                            onSubmit={onSubmit} />
                    )}
                </PropertyModuleWrapper>
            )
        })}</>)
}
