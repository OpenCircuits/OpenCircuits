import "shared/site/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";
import "digital/api/circuit/tests/helpers/Extensions";

import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

import { configureStore } from "@reduxjs/toolkit";

import { reducers } from "digital/site/state/reducers";

import { CreateCircuit } from "digital/api/circuit/public";

import { CreateDesigner, DigitalCircuitDesigner } from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import { DefaultTool } from "shared/api/circuitdesigner/tools/DefaultTool";
import { TimedDigitalSimRunner } from "digital/api/circuit/internal/sim/TimedDigitalSimRunner";

import { App } from "digital/site/containers/App";
import { CircuitHelpers, SetCircuitHelpers } from "shared/site/utils/CircuitHelpers";
import { setCurDesigner } from "shared/site/utils/hooks/useDesigner";

import { OpenHistoryBox } from "shared/site/state/ItemNav";
import { ToggleSideNav } from "shared/site/state/SideNav";

import { V } from "Vector";

describe("New Circuit Integration", () => {
    let store: ReturnType<typeof configureStore>;
    let curDesigner: DigitalCircuitDesigner;

    beforeAll(() => {
        // jsdom does not implement document.elementFromPoint, but ItemNav's global drop handler
        // uses it on any pointerup event (which userEvent.click triggers). We must mock it.
        document.elementFromPoint = jest.fn(() => null);
        
        // Mock confirm because the designer is not 'saved' after placing a switch
        jest.spyOn(window, "confirm").mockImplementation(() => true);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        store = configureStore({ reducer: reducers });

        SetCircuitHelpers({
            CreateAndInitializeDesigner(tools) {
                const circuit = CreateCircuit();
                circuit["ctx"].simRunner = new TimedDigitalSimRunner(circuit["ctx"].sim, 1000 / 20);
                const designer = CreateDesigner(
                    tools?.config ?? {
                        defaultTool: new DefaultTool(),
                        tools: [],
                    },
                    tools?.renderers ?? [],
                    -1,
                    circuit,
                );
                curDesigner = designer;
                return designer;
            },
            Serialize: () => ({ data: new Blob(), version: "" }),
            SerializeAsString: () => "",
            DeserializeCircuit: () => CreateCircuit(),
        });

        const mainDesigner = CircuitHelpers.CreateAndInitializeDesigner();
        setCurDesigner(mainDesigner);
    });

    test("New Circuit resets HistoryBox", async () => {
        const user = userEvent.setup();

        render(
            <Provider store={store}>
                <App />
            </Provider>,
        );

        // Open HistoryBox
        act(() => {
            store.dispatch(OpenHistoryBox());
        });

        // Push an operation to history by placing a component within a transaction
        act(() => {
            curDesigner.circuit.beginTransaction();
            curDesigner.circuit.placeComponentAt("Switch", V(0, 0));
            curDesigner.circuit.commitTransaction("Placed Switch");
        });

        // Verify the history box shows the entry
        expect(screen.getByText("Placed Switch")).toBeVisible();

        // Open SideNav
        act(() => {
            store.dispatch(ToggleSideNav());
        });

        // Click "New Circuit"
        const newCircuitBtn = screen.getByText("New Circuit");
        await user.click(newCircuitBtn);

        // Check if "Placed Switch" is gone
        expect(screen.queryByText("Placed Switch")).toBeNull();
    });
});
