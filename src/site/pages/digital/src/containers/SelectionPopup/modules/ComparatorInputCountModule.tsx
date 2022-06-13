import {CircuitInfo} from "core/utils/CircuitInfo";
import {GroupAction} from "core/actions/GroupAction";

import {Comparator} from "digital/models/ioobjects";

import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";
import {NumberModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/NumberModuleInputField";


type Props = {
    info: CircuitInfo;
}
export const ComparatorInputCountModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, cs] = useSelectionProps(
        info,
        (c): c is Comparator => (c instanceof Comparator),
        (c) => ({ numInputs: c.getInputPortCount().getValue()/2 })
    );

    if (!props)
        return null;

    return <div>
        Input Count
        <label>
            <NumberModuleInputField
                type="int" min={1} max={8} step={1}
                props={props.numInputs}
                getAction={(newCount) =>
                    new GroupAction(
                        cs.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue()/2, newCount)),
                        "Comparator Input Count Module"
                    )}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }}
                alt="Number of input object(s) have" />
        </label>
    </div>
}


// const Config: ModuleConfig<[Comparator], number> = {
//     types: [Comparator],
//     valType: "int",
//     getProps: (o) => o.getInputPortCount().getValue()/2,
//     getAction: (s, newCount) =>
//         new GroupAction(s.map(o => new InputPortChangeAction(o, o.getInputPortCount().getValue()/2, newCount)), "Comparator Input Count Module")
// }

// export const ComparatorInputCountModule = PopupModule({
//     label: "Input Count",
//     modules: [CreateModule({
//         inputType: "number",
//         config: Config,
//         step: 1, min: 1, max: 8,
//         alt: "Number of inputs object(s) have"
//     })]
// });
