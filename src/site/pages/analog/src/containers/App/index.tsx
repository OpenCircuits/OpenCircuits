import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {CircuitInfoHelpers} from "shared/utils/CircuitInfoHelpers";

import {useWindowSize} from "shared/utils/hooks/useWindowSize";

import {ContextMenu}     from "shared/containers/ContextMenu";
import {SideNav}         from "shared/containers/SideNav";

import {LoginPopup}         from "shared/containers/LoginPopup";
import {ImageExporterPopup} from "shared/containers/ImageExporterPopup";
import {HistoryBox}         from "shared/containers/HistoryBox";
import {SelectionPopup}     from "shared/containers/SelectionPopup";
import {PositionModule}     from "shared/containers/SelectionPopup/modules/PositionModule";

import {AnalogPaste} from "site/analog/utils/AnalogPaste";

import {AnalogHeader}          from "site/analog/containers/AnalogHeader";
import {AnalogItemNav}         from "site/analog/containers/AnalogItemNav";
import {KeyboardShortcutsPopup} from "site/analog/containers/KeyboardShortcutsPopup";
import {MainDesigner}           from "site/analog/containers/MainDesigner";
import {QuickStartPopup}        from "site/analog/containers/QuickStartPopup";
import {ImageExporterPreview}   from "site/analog/containers/ImageExporterPreview";

import {PropertyModule} from "site/analog/containers/SelectionPopup/modules/PropertyModule";

import exampleConfig from "site/analog/data/examples.json";
import docsConfig from "site/analog/data/docsUrlConfig.json";

import "./index.scss";


const exampleCircuits = exampleConfig.examples.map((example) =>
    new CircuitMetadataBuilder()
        .withId(example.file)
        .withName(example.name)
        .withOwner("Example")
        .withDesc("Example Circuit")
        .withThumbnail(example.thumbnail)
        .build()
);

type Props = {
    info: AnalogCircuitInfo;
    helpers: CircuitInfoHelpers;
    canvas: React.RefObject<HTMLCanvasElement>;
}
export const App = ({ info, helpers, canvas }: Props) => {
    const { h } = useWindowSize();

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
                    <MainDesigner info={info} canvas={canvas} />

                    <AnalogItemNav info={info} />
                    <HistoryBox info={info} />

                    <SelectionPopup info={info}
                                    docsUrlConfig={docsConfig}>
                        <PositionModule info={info} />
                        <PropertyModule info={info} />
                    </SelectionPopup>

                    <ContextMenu info={info}
                                 paste={(data, menuPos) => AnalogPaste(data, info, menuPos)} />
                </main>
            </div>

            <QuickStartPopup />
            <KeyboardShortcutsPopup />
            <ImageExporterPopup preview={(props) => (
                <ImageExporterPreview mainInfo={info} {...props} />
            )} />

            <LoginPopup />
        </div>
    );
};
