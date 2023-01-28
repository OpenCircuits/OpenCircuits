import {Circuit} from "core/public";

import {TextModuleInputField} from "./inputs/TextModuleInputField";
import {useSelectionProps}    from "./useSelectionProps";


type Props = {
    circuit: Circuit;
}
export const TitleModule = ({ circuit }: Props) => {
    const [props] = useSelectionProps(
        circuit,
        (o): o is AnyObj => true,
        (o) => ({ name: (o.name ?? o.kind) })
    );

    if (!props)
        return null;

    const s = circuit.selectedObjs();

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
                onSubmit={({ isFinal, action }) => {å
                    renderer.render();
                    if (isFinal)
                        history.add(action);
                }} />
        </label>
    </div>)
}
