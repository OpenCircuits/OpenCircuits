import {GroupAction} from "core/actions/GroupAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {SetPropertyAction} from "analog/actions/SetPropertyAction";
import {AnalogComponent, Prop} from "analog/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {TextModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/TextModuleInputField";
import {ColorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";
import {ModuleSubmitInfo} from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";


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

    return <>
        {Object.entries(props).map(([key, vals]) => {
            const info = cs[0].getPropInfo(key);
            if (!info)
                throw new Error(`Failed to get prop info for ${key}!`);

            const { type, readonly, display, isActive, ...otherInfo } = info;

            const active = (isActive) ? (cs.every(a => (isActive!(a.getProps())))) : (true);
            if (!active)
                return null;

            // For now just take 1st component state for display
            //  TODO: Maybe improve this
            const curDisplay = (
                typeof display === "string"
                ? display
                : display(cs[0].getProps())
            );

            const InputFieldProps = {
                getAction: (newVal: Prop) => new GroupAction(
                    cs.map(a => new SetPropertyAction(a, key, newVal))
                ),
                onSubmit: (info: ModuleSubmitInfo) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                },
                alt: `${curDisplay} proeprty of object`,
                ...otherInfo,
            }

            return <div key={`property-module-${key}`}>
                {curDisplay}
                <label>
                    { readonly
                        ? ((vals as Prop[]).every(v => v === vals[0]) ? vals[0] : "-")
                        : ( type === "string"
                            ? <TextModuleInputField   props={vals as string[]} {...InputFieldProps} />
                            : (type === "color")
                            ? <ColorModuleInputField  props={vals as string[]} {...InputFieldProps} />
                            : (type === "int" || type === "float")
                            ? <NumberModuleInputField props={vals as number[]} {...InputFieldProps} />
                            : (type === "number[]")
                            ? <SelectModuleInputField kind="number[]" props={vals as number[]} options={info.options}
                                {...InputFieldProps} onSubmit={(info) => {
                                    InputFieldProps.onSubmit(info);
                                    forceUpdate(); // Need to force update since these can trigger info-state changes
                                                    //  and feel less inituitive to the user about focus/blur
                                }} />
                            : (type === "string[]")
                            ? <SelectModuleInputField kind="string[]" props={vals as string[]} options={info.options}
                                {...InputFieldProps} onSubmit={(info) => {
                                    InputFieldProps.onSubmit(info);
                                    forceUpdate(); // Need to force update since these can trigger info-state changes
                                                    //  and feel less inituitive to the user about focus/blur
                                }} />
                            : <div>ERROR, invalid type: {type}</div>
                        )}
                </label>
            </div>;
        })}
    </>
}
