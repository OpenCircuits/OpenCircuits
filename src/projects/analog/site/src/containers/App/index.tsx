import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import {BackendCircuitMetadata} from "shared/site/api/Circuits";

import {Header}             from "shared/site/containers/Header";
import {ContextMenu}        from "shared/site/containers/ContextMenu";
import {HistoryBox}         from "shared/site/containers/HistoryBox";
import {ImageExporterPopup} from "shared/site/containers/ImageExporterPopup";
import {LoginPopup}         from "shared/site/containers/LoginPopup";
import {SelectionPopup}     from "shared/site/containers/SelectionPopup";
import {SideNav}            from "shared/site/containers/SideNav";
import {PropertyModule}     from "shared/site/containers/SelectionPopup/modules/PropertyModule";
import {MainDesigner}       from "shared/site/containers/MainDesigner";
import {ItemNav}            from "shared/site/containers/ItemNav";

import {useCurAnalogDesigner} from "analog/site/utils/hooks/useAnalogDesigner";

import {SimButtons} from "analog/site/containers/SimButtons";

import {KeyboardShortcutsPopup} from "analog/site/containers/KeyboardShortcutsPopup";
import {QuickStartPopup}        from "analog/site/containers/QuickStartPopup";

import {AnalogPropInfo} from "analog/site/containers/SelectionPopup/propinfo";

import docsConfig    from "analog/site/data/docsUrlConfig.json";
import exampleConfig from "analog/site/data/examples.json";
import itemNavConfig from "analog/site/data/ItemNavConfig";

import "./index.scss";


const exampleCircuits = exampleConfig.examples.map((example) => ({
    id:        example.file,
    name:      example.name,
    desc:      "Example Circuit",
    thumbnail: example.thumbnail,
    version:   "/",
} satisfies BackendCircuitMetadata));

export const App = () => {
    const designer = useCurAnalogDesigner();
    const { h } = useWindowSize();

    return (
        <div className="App">
            <SideNav exampleCircuits={exampleCircuits} />

            <div className="App__container" style={{ height: h+"px" }}>
                <Header img="/assets/logo.svg" extraUtilities={[]} />

                <main>
                    <MainDesigner />

                    <ItemNav
                        designer={designer}
                        config={itemNavConfig} />
                    <HistoryBox designer={designer} />

                    <SimButtons />

                    <SelectionPopup designer={designer} docsUrlConfig={docsConfig}>
                        <PropertyModule designer={designer} propInfo={AnalogPropInfo} />
                        {/* <OscilloscopePlotsModule designer={designer} /> */}
                    </SelectionPopup>

                    <ContextMenu designer={designer} />
                </main>
            </div>

            {/* <ICDesigner />
            <ICViewer /> */}

            <QuickStartPopup />
            <KeyboardShortcutsPopup />
            <ImageExporterPopup designer={designer} />

            <LoginPopup />
        </div>
    );
};