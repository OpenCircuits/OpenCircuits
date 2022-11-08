import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {SetProperty} from "core/actions/units/SetProperty";

import {AnyObj} from "core/models/types";

import {TextModuleInputField} from "./inputs/TextModuleInputField";
import {useSelectionProps}    from "./useSelectionProps";


type Props = {
    info: CircuitInfo;
}
export const TitleModule = ({ info }: Props) => {
    const { circuit, selections, renderer, history } = info;

    const [props] = useSelectionProps(
        info,
        (o): o is AnyObj => true,
        (o) => ({ name: (o.name ?? o.kind) })
    );

    if (!props)
        return null;

    const s = selections.get();

    return (<div>
        <label>
            <TextModuleInputField
                props={props.name}
                placeholder="<Multiple>"
                alt="Name of object(s)"
                getAction={(newNames) => new GroupAction(
                    s.map((id, i) => SetProperty(circuit, id, "name", newNames[i])),
                    "Title Module"
                )}
                onSubmit={({ isFinal, action }) => {
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>)
}
