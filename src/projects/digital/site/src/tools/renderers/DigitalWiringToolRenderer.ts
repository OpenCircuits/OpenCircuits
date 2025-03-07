import {DigitalPort} from "digital/api/circuit/public/DigitalPort";
import {Signal}      from "digital/api/circuit/utils/Signal";

import {WiringToolRenderer} from "shared/api/circuitdesigner/tools/renderers/WiringToolRenderer";

import {WiringTool} from "shared/api/circuitdesigner/tools/WiringTool";


export const DigitalWiringToolRenderer = WiringToolRenderer(
    ({ designer: { curTool }, renderer }) => {
        if (!(curTool instanceof WiringTool))
            return;

        const port = curTool.getCurPort() as DigitalPort | undefined;
        if (!port)
            return;

        const signal = port?.signal;
        if (signal === Signal.On)
            return renderer.options.defaultOnColor;
        if (signal === Signal.Metastable)
            return renderer.options.defaultMetastableColor;
        return renderer.options.defaultWireColor;
    }
);
