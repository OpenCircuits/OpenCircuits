import {useEffect, useMemo, useState} from "react";
import {GetIDFor}                     from "serialeazy";

import {GroupAction} from "core/actions/GroupAction";

import {DigitalCircuitInfo}                       from "digital/utils/DigitalCircuitInfo";
import {GenerateReplacementList, GetReplacements} from "digital/utils/ReplaceDigitalComponentHelpers";

import {ReplaceComponent} from "digital/actions/compositions/ReplaceComponent";

import {DigitalComponent, DigitalEvent} from "digital/models";

import {IC} from "digital/models/ioobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {SelectModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/SelectModuleInputField";

import itemNavConfig from "site/digital/data/itemNavConfig.json";


const allBaseComponentIDs = [
    ...itemNavConfig.sections.flatMap((s) => s.items.map((i) => i.id)),
    "DigitalNode",
];

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

    // Replace list is a utility data structure to map replacements
    const initialReplacementList = useMemo(() => GenerateReplacementList(designer, allBaseComponentIDs), [designer]);
    const [replacementList, setReplacementList] = useState(initialReplacementList);

    // Need to update the replacement list whenever the ICs are changed
    useEffect(() => {
        const callback = (ev: DigitalEvent) => {
            if (ev.type !== "ic")
                return;

            const ics = designer.getICData().map((_,i) => `ic/${i}`);
            const newList = GenerateReplacementList(designer, [...allBaseComponentIDs, ...ics]);
            setReplacementList(newList);
        }

        designer.addCallback(callback);
        return () => designer.removeCallback(callback);
    }, [designer]);

    if (!(props && props.componentId && components.length === 1))
        return null;

    const replaceables = GetReplacements(components[0], designer, replacementList);
    if (replaceables.length <= 1)
        return null;

    // updateImmediately is required because this action changes the selected item thus changing the selection popup.
    // updateImmediately forces the selection popup to update.
    // TODO: Remove the need for updateImmediately with/after the model refactor
    return (<div>
        Replace Component
        <label>
            <SelectModuleInputField
                kind="string[]"
                options={replaceables.map((rep, i) => [rep.id, `${i}`])}
                props={props.componentId}
                getAction={(vals) =>
                    new GroupAction(
                        components.map((c, i) => {
                            const replacementIdx = parseInt(vals[i]);
                            const replacement = replaceables[replacementIdx];
                            return ReplaceComponent(designer, c, replacement, selections)[0];
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
