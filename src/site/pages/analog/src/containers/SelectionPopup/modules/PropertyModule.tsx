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

            // const inputField = (() => {
            //     switch (info.type) {
            //         case "string":
            //             return TextModuleInputField;
            //         case "color":
            //             return ColorModuleInputField;
            //         case "float":
            //         case "int":
            //             return NumberModuleInputField;
            //     }
            // })();
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
                    {info.type === "string"
                        ? <TextModuleInputField props={vals as string[]} {...InputFieldProps} />
                        : (info.type === "color")
                        ? <ColorModuleInputField props={vals as string[]} {...InputFieldProps} />
                        : <NumberModuleInputField props={vals as number[]} {...InputFieldProps} />}
                    {/* <NumberModuleInputField
                        props={vals as number[]}
                        getAction={(newVal) => new GroupAction(
                            cs.map(a => new SetPropertyAction(a, key, newVal))
                        )}
                        onSubmit={(info) => {
                            renderer.render();
                            if (info.isValid && info.isFinal)
                                history.add(info.action);
                        }}
                        alt={`${info.display} property of object`}
                        {...info}
                        /> */}
                    {/* {inputField({
                        props: (vals as any[]),
                        getAction: (newVal) => new GroupAction(
                            cs.map(a => new SetPropertyAction(a, key, newVal))
                        ),
                        onSubmit: (info) => {
                            renderer.render();
                            if (info.isValid && info.isFinal)
                                history.add(info.action);
                        },
                        alt: `${info.display} property of object`,
                        ...info,
                    })} */}
                </label>
            </div>;
        })}
    </>
}


// export const PropertyModule = ({ info }: UseModuleProps) => {
//     const { selections } = info;

//     const comps = selections.get().filter(s => (s instanceof AnalogComponent)) as AnalogComponent[];

//     // comps.map((c) => {
//     //     c.getProps()
//     // });
//     if (comps.length === 0)
//         return null;

//     const c = comps[0];

//     const props = c.getProps();

//     return <>
//         {Object.entries(props).map(([key, prop]) => {
//             const inputType = (
//                 prop.type === "string" ? "text" :
//                 prop.type === "float" ? "number" :
//                 prop.type === "int" ? "number" :
//                 prop.type
//             );

//             const valType = (prop.type === "color" ? "string" : prop.type);

//             const module = CreateModule({
//                 inputType,
//                 config: {
//                     types: [AnalogComponent],
//                     valType,
//                     getProps: (o) => o.getProp(key).val,
//                     getAction: (s, newProp) => new GroupAction(
//                         s.map(a => new SetPropertyAction(
//                             a, key, newProp
//                         ))
//                     ),
//                 } as ModuleConfig<[AnalogComponent], string | number>,
//                 alt: "",
//             })

//             return (<div key={`selection-popup-property-module-${key}`}>
//                 {prop.display}
//                 <label unselectable="on">
//                     {module({ info })}
//                     {/* {ms.map((m, i) => cloneElement(m!, {key: `selection-popup-${label}-module-${i}`}))} */}
//                 </label>
//             </div>);
//         })}
//     </>
// };
// const Config: ModuleConfig<[Label, Wire], string> = {
//     types: [Label, Wire],
//     valType: "string",
//     isActive: (selections) => {
//         // Make sure that this is only active if all the types are LED/Label/Wire/Node, but not ONLY Nodes
//         return selections.all((s) => (isNode(s) || s instanceof Label || s instanceof Wire)) &&
//                !selections.all((s) => isNode(s));
//     },
//     getProps: (o) => (isNode(o) ? undefined : o.getColor()),
//     getAction: (s, newCol) => new GroupAction(
//         s.filter(o => !isNode(o))
//          .map(o => new ColorChangeAction(o, newCol)),
//         "Color Module"
//     ),
// }

// export const PropertyModule = PopupModule({
//     label: "Properties",
//     modules: [CreateModule({
//         inputType: "color",
//         config: Config,
//         alt: "Color of object(s)",
//     })],
// });
