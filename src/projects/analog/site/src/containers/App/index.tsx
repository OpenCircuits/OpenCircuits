import {AnalogPropInfo} from "analog/views/info";
import {useCallback}    from "react";

import {SAVE_VERSION} from "core/utils/Constants";

import {CircuitMetadata} from "core/models/Circuit";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {ContextMenu}               from "shared/containers/ContextMenu";
import {HistoryBox}                from "shared/containers/HistoryBox";
import {ImageExporterPopup,
        ImageExporterPreviewProps} from "shared/containers/ImageExporterPopup";
import {LoginPopup}     from "shared/containers/LoginPopup";
import {MainDesigner}   from "shared/containers/MainDesigner";
import {SelectionPopup} from "shared/containers/SelectionPopup";
import {SideNav}        from "shared/containers/SideNav";

import {PropertyModule} from "shared/containers/SelectionPopup/modules/PropertyModule";

import {AnalogPaste} from "site/analog/utils/AnalogPaste";

import {AnalogHeader}           from "site/analog/containers/AnalogHeader";
import {AnalogItemNav}          from "site/analog/containers/AnalogItemNav";
import {ImageExporterPreview}   from "site/analog/containers/ImageExporterPreview";
import {KeyboardShortcutsPopup} from "site/analog/containers/KeyboardShortcutsPopup";
import {QuickStartPopup}        from "site/analog/containers/QuickStartPopup";
import {SimButtons}             from "site/analog/containers/SimButtons";

import docsConfig    from "site/analog/data/docsUrlConfig.json";
import exampleConfig from "site/analog/data/examples.json";

import {OscilloscopePlotsModule} from "../SelectionPopup/modules/OscilloscopePlotsModule";

import "./index.scss";


const exampleCircuits = exampleConfig.examples.map((example) => ({
    id:        example.file,
    name:      example.name,
    desc:      "Example Circuit",
    thumbnail: example.thumbnail,
    version:   SAVE_VERSION,
} as CircuitMetadata));

type Props = {
    info: AnalogCircuitInfo;
    helpers: CircuitInfoHelpers;
}
export const App = ({ info, helpers }: Props) => {
    const { h } = useWindowSize();

    // Memoize for eslint(react/no-unstable-nested-components)
    const imageExporterPreview = useCallback((props: ImageExporterPreviewProps) => (
        <ImageExporterPreview mainInfo={info} {...props} />
    ), [info]);

    return (
        <div className="App">
            <SideNav
                helpers={helpers}
                exampleCircuits={exampleCircuits} />

            <div className="App__container" style={{ height: h+"px" }}>
                <AnalogHeader
                    img="img/icons/logo.svg"
                    helpers={helpers}
                    info={info} />

                <main>
                    <MainDesigner info={info} />

                    <AnalogItemNav info={info} />
                    <HistoryBox info={info} />

                    <SimButtons info={info} />

                    <SelectionPopup info={info}
                                    docsUrlConfig={docsConfig}>
                        <PropertyModule info={info} propInfo={AnalogPropInfo} />
                        <OscilloscopePlotsModule info={info} />
                    </SelectionPopup>

                    <ContextMenu info={info}
                                 paste={(data, menuPos) => AnalogPaste(data, info, menuPos)} />
                </main>
            </div>

            <QuickStartPopup />
            <KeyboardShortcutsPopup />
            <ImageExporterPopup preview={imageExporterPreview} />

            <LoginPopup />
        </div>
    );
};
