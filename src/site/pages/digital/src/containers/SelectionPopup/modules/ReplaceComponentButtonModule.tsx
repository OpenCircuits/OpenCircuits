import {useState} from "react";
import {GetIDFor} from "serialeazy";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {CanReplace} from "digital/utils/ReplaceDigitalComponentHelpers";

import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {DigitalComponent} from "digital/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


type Props = {
    info: CircuitInfo;
}
export const ReplaceComponentButtonModule = ({ info }: Props) => {
    const { history, renderer } = info;

    const [props, components] = useSelectionProps(
        info,
        (s): s is DigitalComponent => (s instanceof DigitalComponent),
        (_) => ({ componentId: true }) // Required for button to appear
    );

    // const [replacement, setReplacement] = useState(undefined as string | undefined);

    if (!(props && components.length === 1))
        return null;

    const component = components[0];
    const replaceables = itemNavConfig.sections.flatMap(section =>
        section.items.filter(item => CanReplace(component, item.id)
                                  && item.id !== GetIDFor(component))
    );

    if (replaceables.length === 0)
        return null;

    return (<>
        Replace Component
        <label>
            <SelectModuleInputField
                kind="string[]"
                options={replaceables.map(rep => [rep.label, rep.id])}
                props={["hu"]}
                getAction={(replacement) => {
                    const [action] = CreateReplaceDigitalComponentAction(component, replacement, info.selections);
                    return action.undo();
                }}
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isValid && info.isFinal)
                        history.add(info.action);
                }} />
        </label>
        {/* <button type="button"
                title="Replace the component with the selected component"
                disabled={!replacement}
                onClick={() => {
                    const [action] = CreateReplaceDigitalComponentAction(component, replacement!, info.selections);
                    info.history.add(action);
                    renderer.render();
                }}>
            Replace
        </button> */}
    </>);
}
