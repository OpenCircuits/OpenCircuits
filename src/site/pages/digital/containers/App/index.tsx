import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {Header} from "shared/containers/Header";
import {SideNav} from "shared/containers/SideNav";
import {ItemNav} from "shared/containers/ItemNav";
import {MainDesigner} from "../MainDesigner";

import exampleConfig from "site/digital/data/examples/examples.json";

import "./index.css";
import {KeyboardShortcutsPopup} from "../KeyboardShortcutsPopup";
import {QuickStartPopup} from "../QuickStartPopup";


const exampleCircuits = exampleConfig.examples.map((example) =>
    new CircuitMetadataBuilder()
        .withId(example.id)
        .withName(example.name)
        .withOwner("Example")
        .withDesc("Example Circuit")
        .withThumbnail(example.thumbnail)
        .build()
);

export function App() {
    return (
        <div className="App">
            <SideNav exampleCircuits={exampleCircuits} />

            <main>
                <Header img="img/icons/logo.svg" />

                <MainDesigner />
                {/* <MainDesigner /> */}
                    {/* <SelectionPopup /> */}
                    {/* <ContextMenu /> */}

                {/* <ICDesigner /> */}

                {/* <ICViewer /> */}

                <QuickStartPopup />
                <KeyboardShortcutsPopup />
                {/* <LoginPopup /> */}
            </main>
        </div>
    );
}
