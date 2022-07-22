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
    const { history, renderer, selections } = info;

    const [props, components] = useSelectionProps(
        info,
        (s): s is DigitalComponent => (s instanceof DigitalComponent),
        (c) => ({ componentId: GetIDFor(c)! })
    );

    if (!(props && props.componentId && components.length === 1))
        return null;

    const component = components[0];
    const replaceables = itemNavConfig.sections.flatMap(section =>
        section.items.filter(item => CanReplace(component, item.id))
    );

    if (replaceables.length === 0)
        return null;

    return (<>
        Replace Component
        <label>
            <SelectModuleInputField
                kind="string[]"
                options={replaceables.map(rep => [rep.label, rep.id])}
                props={props.componentId}
                getAction={(replacements) =>
                    new GroupAction(
                        components.map((c, i) =>
                                       CreateReplaceDigitalComponentAction(c, replacements[i], selections)[0]),
                        "Replace Component Module"
                    )}
                updateImmediately
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isFinal)
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
