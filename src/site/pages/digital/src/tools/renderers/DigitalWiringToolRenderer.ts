import {RenderOptions} from "core/internal/view/rendering/RenderOptions";
import {DigitalPort}   from "digital/public/api/DigitalPort";
import {Signal}        from "digital/public/utils/Signal";

import {WiringToolRenderer} from "shared/tools/renderers/WiringToolRenderer"

import {WiringTool} from "shared/tools/WiringTool";


export class DigitalWiringToolRenderer extends WiringToolRenderer {
    protected override getColor(options: RenderOptions, curTool: WiringTool): string | undefined  {
        const port = curTool.getCurPort() as DigitalPort | undefined;
        if (!port)
            return undefined;

        const signal = port?.signal;
        if (signal === Signal.On)
            return options.defaultOnColor;
        if (signal === Signal.Metastable)
            return options.defaultMetastableColor;
        return options.defaultWireColor;
    }
}