import "shared/site/tests/helpers/Extensions";

import "@testing-library/jest-dom";
import {act, render, screen}          from "@testing-library/react";
import userEvent                      from "@testing-library/user-event";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {OpenHeaderPopup} from "shared/site/state/Header";

import {PressToggle} from "shared/site/tests/helpers/PressToggle";

import {AppState} from "digital/site/state";

import {AllActions} from "digital/site/state/actions";
import {reducers}   from "digital/site/state/reducers";

import {ExprToCircuitPopup} from "digital/site/containers/ExprToCircuitPopup";

import {CreateCircuit} from "digital/api/circuit/public";

import {CreateDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {DefaultTool} from "shared/api/circuitdesigner/tools/DefaultTool";
import {V} from "Vector";


// beforeAll and beforeEach can be used to avoid duplicating store/render code, but is not recommended
//  see: https://testing-library.com/docs/user-event/intro
describe("Main Popup", () => {
    const designer = CreateDesigner(
        {
            defaultTool: new DefaultTool(),
            tools: [],
        },
    )
    const [circuit, _] = CreateCircuit();
    const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
    const user = userEvent.setup();

    beforeEach(() => {
        render(<Provider store={store}><ExprToCircuitPopup {...designer}  /></Provider>);
        act(() => { store.dispatch(OpenHeaderPopup("expr_to_circuit")) });
    });

    afterEach(() => {
        designer.circuit.deleteObjs([...circuit.getWires() , ...circuit.getComponents()]);
        designer.viewport.camera.pos = V(0,0)
    });

    test("Popup Created with default states", () => {
        // Check header and button states
        expect(screen.getByText("Digital Expression To Circuit Generator")).toBeVisible();
        expect(screen.getByText("Cancel")).toBeVisible();
        expect(screen.getByText("Generate")).toBeVisible();
        expect(screen.getByText("Generate")).toBeDisabled();

        // Check format options
        expect(/Programming 1/).toBeToggledOn();
        expect(/Custom/).toBeToggledOff();
        expect(screen.queryByText(/Custom AND/)).toBeNull();

        // Check toggle switches
        expect(/Place labels for inputs/).toBeToggledOff();
        expect(/Generate into IC/).toBeToggledOff();
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();

        // Check dropdowns
        const inputOptions = screen.getByLabelText(/Input Component/).querySelectorAll("option");
        const switchInputOption = [...inputOptions].find((input) => input.text === "Switch");
        expect(switchInputOption?.selected).toBeTruthy();
        const outputOptions = screen.getByLabelText(/Output Component/).querySelectorAll("option");
        const ledOutputOption = [...outputOptions].find((input) => input.text === "LED");
        expect(ledOutputOption?.selected).toBeTruthy();

        // Text input is empty
        const input = screen.getByRole<HTMLInputElement>("textbox");
        expect(input.value).toBe("");
    });

    test("Cancel Button Cancels", async () => {
        await user.type(screen.getByRole("textbox"), "a | b");

        await user.click(screen.getByText("Cancel"));
        expect(screen.getByText("Cancel")).not.toBeVisible();
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeVisible();

        // Reopen and requery in case reference changed
        act(() => { store.dispatch(OpenHeaderPopup("expr_to_circuit")) });
        expect((screen.getByRole<HTMLInputElement>("textbox")).value).toBe("");
    });

    test("Generate Button", async () => {
        // Enter the expression and generate
        await user.type(screen.getByRole("textbox"), "a | b");
        expect(screen.getByText("Generate")).toBeEnabled();
        await user.click(screen.getByText("Generate"));
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeVisible();

        // @TODO
        // // Check that the components are placed and connected
        // const components = info.designer.getObjects();
        // expect(components).toHaveLength(4);
        // const inputA = components.find((component) => component instanceof Switch
        //                                            && component.getName() === "a") as Switch;
        // const inputB = components.find((component) => component instanceof Switch
        //                                            && component.getName() === "b") as Switch;
        // const orGate = components.find((component) => component instanceof ORGate) as ORGate;
        // const led = components.find((component) => component instanceof LED) as LED;
        // expect(inputA).toBeDefined();
        // expect(inputB).toBeDefined();
        // expect(orGate).toBeDefined();
        // expect(led).toBeDefined();
        // expect(led.isOn()).toBeFalsy();
        // inputA.click();
        // expect(led.isOn()).toBeTruthy();
        // inputA.click();
        // inputB.click();
        // expect(led.isOn()).toBeTruthy();

        // // Reopen and requery in case reference changed
        // act(() => { store.dispatch(OpenHeaderPopup("expr_to_circuit")) });
        // expect((screen.getByRole<HTMLInputElement>("textbox")).value).toBe("");
    });

    test("Custom format settings appear", async () => {
        await PressToggle("Custom", user);
        expect("Custom").toBeToggledOn();
        expect(screen.queryByText(/Custom AND/)).toBeVisible();
    });

    test("Conditions for options to appear", async () => {
        await user.selectOptions(screen.getByLabelText(/Output Component/), "Oscilloscope");
        expect(screen.queryByText(/Generate into IC/)).toBeNull();
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();

        await user.selectOptions(screen.getByLabelText(/Input Component/), "Clock");
        expect(/Connect Clocks/).toBeToggledOff();

        await user.selectOptions(screen.getByLabelText(/Input Component/), "Switch");
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();
    });
});
