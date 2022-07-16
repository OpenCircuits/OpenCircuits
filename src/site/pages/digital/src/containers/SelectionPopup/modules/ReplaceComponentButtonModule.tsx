import {useState}         from "react";
import {Create, GetIDFor} from "serialeazy";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {CanReplace} from "digital/utils/ReplaceDigitalComponentHelpers";

import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {DigitalComponent} from "digital/models";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


type Props = {
    info: CircuitInfo;
}
export const ReplaceComponentButtonModule = ({ info }: Props) => {
    const { renderer } = info;

    const [props, components] = useSelectionProps(
        info,
        (s): s is DigitalComponent => (s instanceof DigitalComponent),
        (_) => ({ componentId: true }) // Required for button to appear
    );

    const [replacement, setReplacement] = useState(undefined as string | undefined);

    if (!(props && components.length === 1))
        return null;

    const component = components[0];
    const replaceables = itemNavConfig.sections.flatMap(section =>
        section.items.filter(item => CanReplace(component, item.id)
                                  && item.id !== GetIDFor(component))
    );

    return (<>
        <select id="replacementComponent" value={replacement}
                onChange={e => setReplacement(e.target.value)}
                onBlur={e => setReplacement(e.target.value)}>
            {replaceables.map(replaceable =>
                <option key={replaceable.id} value={replaceable.id}>{replaceable.label}</option>
            )}
        </select>
        <button type="button"
                title="Replace the component with the selected component"
                disabled={!replacement}
                onClick={() => {
                    info.history.add(CreateReplaceDigitalComponentAction(component,
                                                                         Create(replacement!),
                                                                         info.selections));
                    renderer.render();
                }}>
            Replace
        </button>
    </>);
}
