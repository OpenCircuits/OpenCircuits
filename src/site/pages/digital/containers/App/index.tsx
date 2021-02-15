import {CircuitMetadataBuilder} from "core/models/CircuitMetadata";

import {SideNav} from "shared/containers/SideNav";
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
                <MainDesigner />

                <QuickStartPopup />
                <KeyboardShortcutsPopup />
                {/* <LoginPopup /> */}
            </main>
        </div>
    );
}
