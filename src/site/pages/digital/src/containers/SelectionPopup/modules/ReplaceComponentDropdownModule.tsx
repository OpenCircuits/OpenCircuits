import {GetIDFor} from "serialeazy";

import {GroupAction} from "core/actions/GroupAction";

import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {CanReplace}         from "digital/utils/ReplaceDigitalComponentHelpers";

import {CreateReplaceDigitalComponentAction} from "digital/actions/ReplaceDigitalComponentActionFactory";

import {DigitalComponent} from "digital/models";

import {IC} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


type ICID = `ic/${number}`;
type Props = {
    info: DigitalCircuitInfo;
}
export const ReplaceComponentDropdownModule = ({ info }: Props) => {
    const { designer, history, renderer, selections } = info;

    const [props, components] = useSelectionProps(
        info,
        (s): s is DigitalComponent => (s instanceof DigitalComponent),
        (c) => ({ componentId: c instanceof IC
                               ? `ic/${designer.getICData().indexOf(c.getData())}`
                               : GetIDFor(c)! })
    );

    if (!(props && props.componentId && components.length === 1))
        return null;

    const component = components[0];

    const ics = designer.getICData().map((d, i) => ({
        id:        `ic/${i}` as ICID,
        label:     d.getName(),
        icon:      "multiplexer.svg",
        removable: true,
    }));

    const replaceables = [
        ...itemNavConfig.sections,
        ...(ics.length === 0 ? [] : [{
            id:    "other",
            label: "ICs",
            items: ics,
        }]),
    ].flatMap(section =>
        section.items.filter(item => {
            const id = item.id;
            const replacement = id.startsWith("ic")
                                ? designer.getICData()[parseInt(id.split("/")[1])]
                                : id;
            return CanReplace(component, replacement);
        })
    );

    if (replaceables.length === 0)
        return null;

    // updateImmediately is required because this action changes the selected item thus changing the selection popup.
    // updateImmediately forces the selection popup to update.
    // TODO: Remove the need for updateImmediately with/after the model refactor
    return (<div>
        Replace Component
        <label>
            <SelectModuleInputField
                kind="string[]"
                options={replaceables.map(rep => [rep.label, rep.id])}
                props={props.componentId}
                getAction={(replacements) =>
                    new GroupAction(
                        components.map((c, i) => {
                            const replacement = replacements[i].startsWith("ic")
                                                ? designer.getICData()[parseInt(replacements[i].split("/")[1])]
                                                : replacements[i];
                                       return CreateReplaceDigitalComponentAction(c, replacement, selections)[0]
                        }),
                        "Replace Component Module"
                    )}
                updateImmediately
                onSubmit={(info) => {
                    renderer.render();
                    if (info.isFinal)
                        history.add(info.action);
                }} />
        </label>
    </div>);
}
