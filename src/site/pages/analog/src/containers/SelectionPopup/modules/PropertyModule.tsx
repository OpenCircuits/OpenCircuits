import {GroupAction} from "core/actions/GroupAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";
import {SetPropertyAction} from "analog/actions/SetPropertyAction";
import {AnalogComponent, Prop} from "analog/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {TextModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/TextModuleInputField";
import {ColorModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";
import {ModuleSubmitInfo} from "shared/containers/SelectionPopup/modules/inputs/ModuleInputField";


type Props = {
    info: AnalogCircuitInfo;
}
export const PropertyModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
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

            const InputFieldProps = {
                getAction: (newVal: Prop) => new GroupAction(
                    cs.map(a => new SetPropertyAction(a, key, newVal))
                ),
                onSubmit: (info: ModuleSubmitInfo) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                },
                alt: `${info.display} proeprty of object`,
                ...info,
            }

            return <div key={`property-module-${key}`}>
                {info.display}
                <label>
                    { info.readonly
                        ? ((vals as Prop[]).every(v => v === vals[0]) ? vals[0] : "-")
                        : ( info.type === "string"
                            ? <TextModuleInputField   props={vals as string[]} {...InputFieldProps} />
                            : (info.type === "color")
                            ? <ColorModuleInputField  props={vals as string[]} {...InputFieldProps} />
                            : <NumberModuleInputField props={vals as number[]} {...InputFieldProps} />
                        )}
                </label>
            </div>;
        })}
    </>
}
