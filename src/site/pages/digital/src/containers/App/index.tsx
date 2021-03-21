import React from "react";
import {createStore, applyMiddleware, Store} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";

import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {ToolManager}        from "core/tools/ToolManager";
import {InteractionTool}    from "core/tools/InteractionTool";
import {PanTool}            from "core/tools/PanTool";
import {RotateTool}         from "core/tools/RotateTool";
import {TranslateTool}      from "core/tools/TranslateTool";
import {WiringTool}         from "core/tools/WiringTool";
import {SplitWireTool}      from "core/tools/SplitWireTool";
import {SelectionBoxTool}   from "core/tools/SelectionBoxTool";

import {LoginPopup}           from "shared/containers/LoginPopup";
import {SelectionPopup}       from "shared/containers/SelectionPopup";
import {PositionModule}       from "shared/containers/SelectionPopup/modules/PositionModule";
import {ViewICButtonModule}   from "site/digital/containers/SelectionPopup/modules/ViewICButtonModule";
import {InputCountModule}     from "site/digital/containers/SelectionPopup/modules/InputCountModule";
import {ColorModule}          from "site/digital/containers/SelectionPopup/modules/ColorModule";
import {ClockFrequencyModule} from "site/digital/containers/SelectionPopup/modules/ClockFrequencyModule";
import {OutputCountModule}    from "site/digital/containers/SelectionPopup/modules/OutputCountModule";
import {SegmentCountModule}   from "site/digital/containers/SelectionPopup/modules/SegmentCountModule";
import {TextColorModule}      from "site/digital/containers/SelectionPopup/modules/TextColorModule";
import {BusButtonModule}      from "site/digital/containers/SelectionPopup/modules/BusButtonModule";
import {CreateICButtonModule} from "site/digital/containers/SelectionPopup/modules/CreateICButtonModule";


import exampleConfig from "site/digital/data/examples.json";


import {MainDesigner} from "../MainDesigner";
import {KeyboardShortcutsPopup} from "../KeyboardShortcutsPopup";
import {QuickStartPopup} from "../QuickStartPopup";

import {ICDesigner} from "site/digital/containers/ICDesigner";
import {ICViewer} from "../ICViewer";
import {DigitalItemNav} from "../DigitalItemNav";
import {DigitalPaste} from "site/digital/utils/DigitalPaste";
import {ContextMenu} from "shared/containers/ContextMenu";
import {UndoRedoButtons} from "shared/containers/UndoRedoButtons";

import {SideNav} from "shared/containers/SideNav";
import {reducers} from "../../state/reducers";
import {GetCookie} from "shared/utils/Cookies";
import {Login} from "shared/state/UserInfo/actions";
import {NoAuthState} from "shared/api/auth/NoAuthState";

import "./index.css";
import {AppStore} from "site/digital/state";
import {Setup} from "site/digital/utils/CircuitInfo/Setup";
import {Header} from "shared/containers/Header";
import {createRef} from "react";
import {SetCircuitSaved} from "shared/state/CircuitInfo/actions";


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
        new InteractionTool(),
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

                <main>
                    <MainDesigner info={info} />

                    <Header img="img/icons/logo.svg"
                            helpers={helpers} />

                    <DigitalItemNav info={info} />
                    
                    <UndoRedoButtons info={info} />

                    <SelectionPopup info={info}
                                    modules={[PositionModule, InputCountModule,
                                            OutputCountModule, SegmentCountModule,
                                            ClockFrequencyModule,
                                            ColorModule, TextColorModule,
                                            BusButtonModule, CreateICButtonModule,
                                            ViewICButtonModule]} />


                    <ICDesigner mainInfo={info} />

                    <ICViewer onActivate={() => info.input.block()}
                            onClose   ={() => info.input.unblock()} />


                    <ContextMenu info={info}
                                paste={(data) => DigitalPaste(data, info)} />

                    <QuickStartPopup />
                    <KeyboardShortcutsPopup />

                    <LoginPopup />
                </main>
            </div>
        );
    }
});
