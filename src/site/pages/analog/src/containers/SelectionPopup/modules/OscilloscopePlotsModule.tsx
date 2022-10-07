import {GroupAction} from "core/actions/GroupAction";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo"

import {SetScopeConfigAction} from "analog/actions/SetScopeConfigAction";

import {Oscilloscope} from "analog/models/eeobjects";

import {useSelectionProps} from "shared/containers/SelectionPopup/modules/useSelectionProps";

import {BooleanModuleInputField} from "shared/containers/SelectionPopup/modules/inputs/BooleanModuleInputField";
import {ColorModuleInputField}   from "shared/containers/SelectionPopup/modules/inputs/ColorModuleInputField";


type Props = {
    info: AnalogCircuitInfo;
}
export const OscilloscopePlotsModule = ({ info }: Props) => {
    const { renderer } = info;

    const [props, os, forceUpdate] = useSelectionProps(
        info,
        (s): s is Oscilloscope => (s instanceof Oscilloscope),
        (o) => ({
            showAxes:   o.getConfig().showAxes,
            showLegend: o.getConfig().showLegend,
            showGrid:   o.getConfig().showGrid,
            ...Object.fromEntries(
                Object.entries(o.getConfig().vecs)
                    .map(([key, vecConfig]) => [`${key}_enabled`, vecConfig.enabled] as const)
            ),
            ...Object.fromEntries(
                Object.entries(o.getConfig().vecs)
                    .map(([key, vecConfig]) => [`${key}_color`, vecConfig.color] as const)
            ),
        } as {
            showAxes: boolean;
            showLegend: boolean;
            showGrid: boolean;
            [key: `${string}_enabled`]: boolean;
            [key: `${string}_color`]: string;
        }),
    );

    if (!props)
        return null;

    const { showAxes, showLegend, showGrid, ...other } = props;

    const otherKeys = [...new Set(
        Object.keys(other)
            .map((k) => k.split("_")[0] as `${string}.${string}`)
    )];

    return (<>
        <div>
            Config
            <div style={{ margin: "5px" }}>
                <BooleanModuleInputField
                    props={showAxes} text="Show Axes"
                    getAction={(showAxes) => new GroupAction(
                        os.map((o,i) => new SetScopeConfigAction(o, { ...o.getConfig(), showAxes: showAxes[i] }))
                    )}
                    onSubmit={() => { renderer.render(); forceUpdate(); }} />
                <BooleanModuleInputField
                    props={showLegend} text="Show Legend"
                    getAction={(showLegend) => new GroupAction(
                        os.map((o,i) => new SetScopeConfigAction(o, { ...o.getConfig(), showLegend: showLegend[i] }))
                    )}
                    onSubmit={() => { renderer.render(); forceUpdate(); }} />
                <BooleanModuleInputField
                    props={showGrid} text="Show Grid"
                    getAction={(showGrid) => new GroupAction(
                        os.map((o,i) => new SetScopeConfigAction(o, { ...o.getConfig(), showGrid: showGrid[i] }))
                    )}
                    onSubmit={() => { renderer.render(); forceUpdate(); }} />
            </div>
        </div>
        <div>
            Plots
            <div style={{ margin: "5px" }}>
                {otherKeys.map((key) => (<div key={`oscilloscope-module-${key}`}>
                    <BooleanModuleInputField
                        props={props[`${key}_enabled`]} text={key.split(".")[1]}
                        getAction={(enabled) => new GroupAction(
                            os.map((o,i) => new SetScopeConfigAction(o, {
                                ...o.getConfig(),
                                "vecs": {
                                    ...o.getConfig().vecs,
                                    [key]: {
                                        ...o.getConfig().vecs[key],
                                        enabled: enabled[i],
                                    },
                                },
                            })
                        ))}
                        onSubmit={(_) => { renderer.render(); forceUpdate(); }} />
                    <ColorModuleInputField
                        props={props[`${key}_color`]}
                        getAction={(colors) => new GroupAction(
                            os.map((o,i) => new SetScopeConfigAction(o, {
                                ...o.getConfig(),
                                "vecs": {
                                    ...o.getConfig().vecs,
                                    [key]: {
                                        ...o.getConfig().vecs[key],
                                        color: colors[i],
                                    },
                                },
                            })
                        ))}
                        onSubmit={(_) => { renderer.render(); forceUpdate(); }} />
                </div>))}
            </div>
        </div>
    </>)
}
