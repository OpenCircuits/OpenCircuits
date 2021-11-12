import {createRef} from "react";

import {InteractionTool}    from "core/tools/InteractionTool";
import {PanTool}            from "core/tools/PanTool";
import {RotateTool}         from "core/tools/RotateTool";
import {TranslateTool}      from "core/tools/TranslateTool";
import {WiringTool}         from "core/tools/WiringTool";
import {SplitWireTool}      from "core/tools/SplitWireTool";
import {SelectionBoxTool}   from "core/tools/SelectionBoxTool";

import {SelectAllHandler}     from "core/tools/handlers/SelectAllHandler";
import {FitToScreenHandler}   from "core/tools/handlers/FitToScreenHandler";
import {DuplicateHandler}     from "core/tools/handlers/DuplicateHandler";
import {DeleteHandler}        from "core/tools/handlers/DeleteHandler";
import {SnipWirePortsHandler} from "core/tools/handlers/SnipWirePortsHandler";
import {DeselectAllHandler}   from "core/tools/handlers/DeselectAllHandler";
import {SelectionHandler}     from "core/tools/handlers/SelectionHandler";
import {SelectPathHandler}    from "core/tools/handlers/SelectPathHandler";
import {UndoHandler}          from "core/tools/handlers/UndoHandler";
import {RedoHandler}          from "core/tools/handlers/RedoHandler";
import {CopyHandler}          from "core/tools/handlers/CopyHandler";
import {PasteHandler}         from "core/tools/handlers/PasteHandler";

import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {SetCircuitSaved} from "shared/state/CircuitInfo";

import {ContextMenu}     from "shared/containers/ContextMenu";
import {SideNav}         from "shared/containers/SideNav";

import {LoginPopup}           from "shared/containers/LoginPopup";
import {SelectionPopup}       from "shared/containers/SelectionPopup";
import {PositionModule}       from "shared/containers/SelectionPopup/modules/PositionModule";

import {DigitalPaste} from "site/digital/utils/DigitalPaste";
import {Setup}        from "site/digital/utils/CircuitInfo/Setup";

import {AppStore} from "site/digital/state";

import {DigitalHeader}          from "site/digital/containers/DigitalHeader";
import {DigitalItemNav}         from "site/digital/containers/DigitalItemNav";
import {ExprToCircuitPopup}     from "site/digital/containers/ExprToCircuitPopup";
import {ICDesigner}             from "site/digital/containers/ICDesigner";
import {ICViewer}               from "site/digital/containers/ICViewer";
import {KeyboardShortcutsPopup} from "site/digital/containers/KeyboardShortcutsPopup";
import {MainDesigner}           from "site/digital/containers/MainDesigner";
import {QuickStartPopup}        from "site/digital/containers/QuickStartPopup";

import {ViewICButtonModule}        from "site/digital/containers/SelectionPopup/modules/ViewICButtonModule";
import {InputCountModule}          from "site/digital/containers/SelectionPopup/modules/InputCountModule";
import {DecoderInputCountModule}   from "site/digital/containers/SelectionPopup/modules/DecoderInputCountModule";
import {SelectPortCountModule}     from "site/digital/containers/SelectionPopup/modules/SelectPortCountModule";
import {ColorModule}               from "site/digital/containers/SelectionPopup/modules/ColorModule";
import {FrequencyModule}           from "site/digital/containers/SelectionPopup/modules/FrequencyModule";
import {OutputCountModule}         from "site/digital/containers/SelectionPopup/modules/OutputCountModule";
import {SegmentCountModule}        from "site/digital/containers/SelectionPopup/modules/SegmentCountModule";
import {TextColorModule}           from "site/digital/containers/SelectionPopup/modules/TextColorModule";
import {BusButtonModule}           from "site/digital/containers/SelectionPopup/modules/BusButtonModule";
import {CreateICButtonModule}      from "site/digital/containers/SelectionPopup/modules/CreateICButtonModule";
import {ConstantNumberInputModule} from "../SelectionPopup/modules/ConstantNumberInputModule";
import {ClockSyncButtonModule}     from "../SelectionPopup/modules/ClockSyncButtonModule";
import {ResumeButtonModule,
        PauseButtonModule}         from "../SelectionPopup/modules/PauseResumeButtonModules";
import {ClearOscilloscopeButtonModule,
        OscilloscopeDisplaySizeModule,
        OscilloscopeInputCountModule,
        OscilloscopeSamplesModule} from "../SelectionPopup/modules/OscilloscopeModules";

import exampleConfig from "site/digital/data/examples.json";

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

export const App = ((store: AppStore) => {
    const canvas = createRef<HTMLCanvasElement>();

    // Setup circuit and get the CircuitInfo and helpers
    const [info, helpers] = Setup(
        store, canvas,
        new InteractionTool([
            SelectAllHandler, FitToScreenHandler, DuplicateHandler,
            DeleteHandler, SnipWirePortsHandler, DeselectAllHandler,
            SelectionHandler, SelectPathHandler, RedoHandler, UndoHandler,
            CopyHandler, PasteHandler((data) => DigitalPaste(data, info))
        ]),
        PanTool, RotateTool,
        TranslateTool, WiringTool,
        SplitWireTool, SelectionBoxTool
    );

    info.history.addCallback(() => {
        store.dispatch(SetCircuitSaved(false));
    });


    return function AppView() {
        return (
            <div className="App">
                <SideNav helpers={helpers}
                         exampleCircuits={exampleCircuits} />

                <div className="App__container">
                    <DigitalHeader img="img/icons/logo.svg"
                                   helpers={helpers}
                                   info={info} />

                    <main>
                        <MainDesigner info={info} canvas={canvas} />

                        <DigitalItemNav info={info} />

                        <SelectionPopup info={info}
                                        modules={[PositionModule, InputCountModule,
                                                  SelectPortCountModule,
                                                  DecoderInputCountModule,
                                                  OutputCountModule, SegmentCountModule,
                                                  OscilloscopeDisplaySizeModule,
                                                  OscilloscopeInputCountModule,
                                                  FrequencyModule, OscilloscopeSamplesModule,
                                                  ResumeButtonModule, PauseButtonModule,
                                                  ClearOscilloscopeButtonModule,
                                                  ColorModule, TextColorModule,
                                                  BusButtonModule, CreateICButtonModule,
                                                  ViewICButtonModule, ConstantNumberInputModule,
                                                  ClockSyncButtonModule]} />

                        <ContextMenu info={info}
                                     paste={(data) => DigitalPaste(data, info)} />
                    </main>
                </div>

                <ICDesigner mainInfo={info} />
                <ICViewer mainInfo={info} />

                <QuickStartPopup />
                <KeyboardShortcutsPopup />

                <ExprToCircuitPopup mainInfo={info} />

                <LoginPopup />
            </div>
        );
    }
});
