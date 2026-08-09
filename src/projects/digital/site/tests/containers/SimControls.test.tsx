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
import { TimedScheduler } from "digital/site/utils/TimedScheduler";

import { App } from "digital/site/containers/App";
import { CircuitHelpers, SetCircuitHelpers } from "shared/site/utils/CircuitHelpers";
import { setCurDesigner } from "shared/site/utils/hooks/useDesigner";

describe("SimControls Integration", () => {
    let store: ReturnType<typeof configureStore>;

    beforeAll(() => {
        document.elementFromPoint = jest.fn(() => null);
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
                circuit.sim.setScheduler(new TimedScheduler());
                circuit.sim.propagationTime = 1000 / 20; // propagationTime = 50
                const designer = CreateDesigner(
                    tools?.config ?? {
                        defaultTool: new DefaultTool(),
                        tools: [],
                    },
                    tools?.renderers ?? [],
                    -1,
                    circuit,
                );
                return designer;
            },
            Serialize: () => ({ data: new Blob(), version: "" }),
            SerializeAsString: () => "",
            DeserializeCircuit: () => CreateCircuit(),
        });

        const mainDesigner = CircuitHelpers.CreateAndInitializeDesigner();
        setCurDesigner(mainDesigner);
    });

    test("SimControls updates when new circuit is loaded", async () => {
        const user = userEvent.setup();

        render(
            <Provider store={store}>
                <App />
            </Provider>,
        );

        // Open SimControls
        const controlsBtn = screen.getByTitle("Simulation Controls");
        await user.click(controlsBtn);

        // Verify initial speed (1000 / 50 = 20)
        // Note: spinbutton is the <input type="number"> in NumberInputField
        const speedInput = screen.getByRole("spinbutton");
        expect(speedInput).toHaveValue(20);

        // Load new circuit with different propagation time
        act(() => {
            // Override DeserializeCircuit to simulate a saved file with a different speed
            const prevDeserialize = CircuitHelpers.DeserializeCircuit;
            CircuitHelpers.DeserializeCircuit = () => {
                const c = CreateCircuit();
                c.sim.propagationTime = 100; // Speed 10
                return c;
            };

            CircuitHelpers.LoadNewCircuit("{}");

            CircuitHelpers.DeserializeCircuit = prevDeserialize;
        });

        // The state update in SimControls might be asynchronous because it's in a useEffect.
        // Wait for the new value to appear.
        const speedInput2 = await screen.findByDisplayValue("10.0");
        expect(speedInput2).toBeVisible();
    });
});
