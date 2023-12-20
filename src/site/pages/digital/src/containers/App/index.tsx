import {useWindowSize} from "shared/utils/hooks/useWindowSize";

// import {ContextMenu} from "shared/containers/ContextMenu";
// import {HistoryBox}  from "shared/containers/HistoryBox";
// import {ImageExporterPopup} from "shared/containers/ImageExporterPopup";
// import {LoginPopup} from "shared/containers/LoginPopup";
// import {SelectionPopup}     from "shared/containers/SelectionPopup";
// import {SideNav} from "shared/containers/SideNav";

// import {PropertyModule} from "shared/containers/SelectionPopup/modules/PropertyModule";

// import {useDigitalCircuit} from "site/digital/utils/hooks/useDigitalCircuit";

// import {DigitalHeader}          from "site/digital/containers/DigitalHeader";
// import {DigitalItemNav}         from "site/digital/containers/DigitalItemNav";
import {DigitalMainDesigner}    from "site/digital/containers/DigitalMainDesigner";
// import {KeyboardShortcutsPopup} from "site/digital/containers/KeyboardShortcutsPopup";
// import {QuickStartPopup}        from "site/digital/containers/QuickStartPopup";

// import {BusButtonModule}                from "site/digital/containers/SelectionPopup/modules/BusButtonModule";
// import {ClockSyncButtonModule}          from "site/digital/containers/SelectionPopup/modules/ClockSyncButtonModule";
// import {CreateICButtonModule}           from "site/digital/containers/SelectionPopup/modules/CreateICButtonModule";
// import {OscilloscopeModule}             from "site/digital/containers/SelectionPopup/modules/OscilloscopeModules";
// import {PortCountModule}                from "site/digital/containers/SelectionPopup/modules/PortCountModule";
// import {ReplaceComponentDropdownModule} from "site/digital/containers/SelectionPopup/modules/ReplaceComponentDropdownModule";
// import {ViewICButtonModule}             from "site/digital/containers/SelectionPopup/modules/ViewICButtonModule";

// import docsConfig    from "site/digital/data/docsUrlConfig.json";
// import exampleConfig from "site/digital/data/examples.json";

import "./index.scss";

// import {CircuitMetadata} from "core/public";


// const exampleCircuits = exampleConfig.examples.map((example) => ({
//     id:      example.file,
//     name:    example.name,
//     desc:    "Example Circuit",
//     thumb:   example.thumbnail,
//     version: "/",
// } as CircuitMetadata));

export const App = () => {
    // const circuit = useDigitalCircuit("main");
    const { h } = useWindowSize();

    return (
        <div className="App">
            {/* <SideNav circuit={circuit} exampleCircuits={exampleCircuits} /> */}

            <div className="App__container" style={{ height: h+"px" }}>
                {/* <DigitalHeader /> */}

                <main>
                    <DigitalMainDesigner />

                    {/* <DigitalItemNav /> */}
                    {/* <HistoryBox circuit={circuit} /> */}

                    {/* <SelectionPopup circuit={circuit} docsUrlConfig={docsConfig}>
                        <PropertyModule circuit={circuit} />
                        <PortCountModule circuit={circuit} />
                        <OscilloscopeModule circuit={circuit} />
                        <ClockSyncButtonModule circuit={circuit} />
                        <BusButtonModule circuit={circuit} />
                        <ReplaceComponentDropdownModule circuit={circuit} />
                        <CreateICButtonModule circuit={circuit} />
                        <ViewICButtonModule circuit={circuit} />
                    </SelectionPopup> */}

                    {/* <ContextMenu circuit={circuit} /> */}
                </main>
            </div>

            {/* <ICDesigner />
            <ICViewer /> */}

            {/* <QuickStartPopup />
            <KeyboardShortcutsPopup /> */}
            {/* <ImageExporterPopup circuit={circuit} /> */}

            {/* <ExprToCircuitPopup /> */}

            {/* <LoginPopup /> */}
        </div>
    );
};
