import {useWindowSize} from "shared/site/utils/hooks/useWindowSize";

import {ContextMenu}        from "shared/site/containers/ContextMenu";
import {HistoryBox}  from "shared/site/containers/HistoryBox";
import {ImageExporterPopup} from "shared/site/containers/ImageExporterPopup";
import {LoginPopup}         from "shared/site/containers/LoginPopup";
import {SelectionPopup}     from "shared/site/containers/SelectionPopup";
import {SideNav}            from "shared/site/containers/SideNav";

import {PropertyModule} from "shared/site/containers/SelectionPopup/modules/PropertyModule";

import {useCurDigitalDesigner} from "digital/site/utils/hooks/useDigitalDesigner";

import {DigitalHeader}       from "digital/site/containers/DigitalHeader";
import {DigitalItemNav}      from "digital/site/containers/DigitalItemNav";
import {DigitalMainDesigner} from "digital/site/containers/DigitalMainDesigner";

import {KeyboardShortcutsPopup} from "digital/site/containers/KeyboardShortcutsPopup";
import {QuickStartPopup}        from "digital/site/containers/QuickStartPopup";

import {DigitalPropInfo} from "digital/site/containers/SelectionPopup/propinfo";

import {BusButtonModule}                from "digital/site/containers/SelectionPopup/modules/BusButtonModule";
import {CreateICButtonModule}           from "digital/site/containers/SelectionPopup/modules/CreateICButtonModule";
import {ClearButtonModule}              from "digital/site/containers/SelectionPopup/modules/ClearButtonModule";
import {PauseButtonModule}              from "digital/site/containers/SelectionPopup/modules/PauseButtonModule";
import {PortCountModule}                from "digital/site/containers/SelectionPopup/modules/PortCountModule";
import {ReplaceComponentDropdownModule} from "digital/site/containers/SelectionPopup/modules/ReplaceComponentDropdownModule";
import {SyncButtonModule}               from "digital/site/containers/SelectionPopup/modules/SyncButtonModule";
import {ViewICButtonModule}             from "digital/site/containers/SelectionPopup/modules/ViewICButtonModule";

import docsConfig    from "digital/site/data/docsUrlConfig.json";
import exampleConfig from "digital/site/data/examples.json";

import "./index.scss";
import {ICDesigner} from "digital/site/containers/ICDesigner";
import {ICViewer} from "digital/site/containers/ICViewer";
import {ExprToCircuitPopup} from "digital/site/containers/ExprToCircuitPopup";
import {InteractionHandler} from "digital/api/circuitdesigner/tools/handlers/InteractionHandler";
import {CircuitTypes} from "shared/api/circuit/public/impl/CircuitContext";
import {ToolHandler} from "shared/api/circuitdesigner/tools/handlers/ToolHandler";
import {BackendCircuitMetadata} from "shared/site/api/Circuits";
import {SimControls} from "../SimControls";


const exampleCircuits = exampleConfig.examples.map((example) => ({
    id:        example.file,
    name:      example.name,
    desc:      "Example Circuit",
    thumbnail: example.thumbnail,
    version:   "/",
} satisfies BackendCircuitMetadata));

export const App = () => {
    const designer = useCurDigitalDesigner();
    const { h } = useWindowSize();

    return (
        <div className="App">
            <SideNav exampleCircuits={exampleCircuits} />

            <div className="App__container" style={{ height: h+"px" }}>
                <DigitalHeader />

                <main>
                    <DigitalMainDesigner circuit={designer.circuit} />

                    <DigitalItemNav />
                    <HistoryBox designer={designer} />

                    <SimControls circuit={designer.circuit} />

                    <SelectionPopup designer={designer} docsUrlConfig={docsConfig}>
                        <PropertyModule designer={designer} propInfo={DigitalPropInfo} />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["ANDGate", "NANDGate", "ORGate", "NORGate", "XORGate", "XNORGate"])}
                            basisPortGroup="inputs"
                            label="Input" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["Multiplexer", "Demultiplexer"])}
                            basisPortGroup="selects"
                            label="Selector" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["Encoder"])}
                            basisPortGroup="outputs"
                            label="Output" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["Decoder"])}
                            basisPortGroup="inputs"
                            label="Input" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["Comparator"])}
                            basisPortGroup="inputsA"
                            label="Input" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["SegmentDisplay"])}
                            basisPortGroup="inputs"
                            label="Segment" />
                        <PortCountModule
                            circuit={designer.circuit}
                            kinds={new Set(["Oscilloscope"])}
                            basisPortGroup="inputs"
                            label="Input" />
                        <PauseButtonModule circuit={designer.circuit} />
                        <SyncButtonModule circuit={designer.circuit} />
                        <ClearButtonModule circuit={designer.circuit} />
                        <BusButtonModule circuit={designer.circuit} />
                        <ReplaceComponentDropdownModule circuit={designer.circuit} />
                        <CreateICButtonModule circuit={designer.circuit} />
                        <ViewICButtonModule circuit={designer.circuit} />
                    </SelectionPopup>

                    <ContextMenu designer={designer} />
                </main>
            </div>

            <ICDesigner />
            <ICViewer />

            <QuickStartPopup />
            <KeyboardShortcutsPopup />
            <ImageExporterPopup extraHandlers={[InteractionHandler as ToolHandler<CircuitTypes>]} designer={designer} />

            <ExprToCircuitPopup {...designer} />

            <LoginPopup />
        </div>
    );
};
