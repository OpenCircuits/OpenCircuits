import "@testing-library/jest-dom";
import {Matcher, act, render, screen} from "@testing-library/react";
import userEvent                      from "@testing-library/user-event";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {Setup} from "test/helpers/Setup";

import {LED, ORGate, Switch} from "digital/models/ioobjects";

import {OpenHeaderPopup} from "shared/state/Header";

import {AppState} from "site/digital/state";

import {AllActions} from "site/digital/state/actions";
import {reducers}   from "site/digital/state/reducers";

import {ExprToCircuitPopup} from "site/digital/containers/ExprToCircuitPopup";


/**
 * Gets the ButtonToggle or SwitchToggle images associated with the provided text.
 * The pressed image will be returned first and the unpressed second.
 *
 * @param id The id of the text to search for.
 * @returns    An array containing the pressed and unpressed images, respectively.
 */
function getButtons(id: Matcher): [HTMLImageElement, HTMLImageElement] {
    const buttons = screen.getByText(id).parentNode!.querySelectorAll("img");
    return buttons[0].src.includes("Down")
        ? [buttons[0], buttons[1]]
        : [buttons[1], buttons[0]];
}

// beforeAll and beforeEach can be used to avoid duplicating store/render code, but is not recommended
//  see: https://testing-library.com/docs/user-event/intro
describe("Main Popup", () => {

    test("Popup Created with default states", () => {
        // Basic setup
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});

        // Check header and button states
        expect(screen.getByText("Digital Expression To Circuit Generator")).toBeVisible();
        expect(screen.getByText("Cancel")).toBeVisible();
        expect(screen.getByText("Generate")).toBeVisible();
        expect(screen.getByText("Generate")).toBeDisabled();

        // Check format options
        const [onButton1, offButton1] = getButtons(/Programming 1/);
        expect(onButton1).toBeVisible();
        expect(offButton1).not.toBeVisible();
        const [onButton2, offButton2] = getButtons(/Custom/);
        expect(onButton2).not.toBeVisible();
        expect(offButton2).toBeVisible();
        expect(screen.queryByText(/Custom AND/)).toBeNull();

        // Check toggle switches
        const [onButton3, offButton3] = getButtons(/Place labels for inputs/);
        expect(onButton3).not.toBeVisible();
        expect(offButton3).toBeVisible();
        const [onButton4, offButton4] = getButtons(/Generate into IC/);
        expect(onButton4).not.toBeVisible();
        expect(offButton4).toBeVisible();
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();

        // Check dropdowns
        const inputOptions = screen.getByLabelText(/Input Component/).querySelectorAll("option");
        const switchInputOption = [...inputOptions].find((input) => input.text === "Switch");
        expect(switchInputOption?.selected).toBeTruthy();
        const outputOptions = screen.getByLabelText(/Output Component/).querySelectorAll("option");
        const ledOutputOption = [...outputOptions].find((input) => input.text === "LED");
        expect(ledOutputOption?.selected).toBeTruthy();

        // Text input is empty
        const input = screen.getByPlaceholderText("!a | (B^third)") as HTMLInputElement;
        expect(input.value).toBe("");
    });

    test("Cancel Button Cancels", async () => {
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        const user = userEvent.setup();
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});

        await user.type(screen.getByPlaceholderText("!a | (B^third)"), "a | b");

        await user.click(screen.getByText("Cancel"));
        expect(screen.getByText("Cancel")).not.toBeVisible();
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeVisible();

        // Reopen and requery in case reference changed
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});
        expect((screen.getByPlaceholderText("!a | (B^third)") as HTMLInputElement).value).toBe("");
    });

    test("Generate Button", async () => {
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        const user = userEvent.setup();
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});

        // Enter the expression and generate
        await user.type(screen.getByPlaceholderText("!a | (B^third)"), "a | b");
        expect(screen.getByText("Generate")).toBeEnabled();
        await user.click(screen.getByText("Generate"));
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeVisible();

        // Check that the components are placed and connected
        const components = info.designer.getObjects();
        expect(components).toHaveLength(4);
        const inputA = components.find(component => component instanceof Switch
                                                 && component.getName() === "a") as Switch;
        const inputB = components.find(component => component instanceof Switch
                                                 && component.getName() === "b") as Switch;
        const orGate = components.find(component => component instanceof ORGate) as ORGate;
        const led = components.find(component => component instanceof LED) as LED;
        expect(inputA).toBeDefined();
        expect(inputB).toBeDefined();
        expect(orGate).toBeDefined();
        expect(led).toBeDefined();
        expect(led.isOn()).toBeFalsy();
        inputA.click();
        expect(led.isOn()).toBeTruthy();
        inputA.click();
        inputB.click();
        expect(led.isOn()).toBeTruthy();

        // Reopen and requery in case reference changed
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});
        expect((screen.getByPlaceholderText("!a | (B^third)") as HTMLInputElement).value).toBe("");
    });

    test("Custom format settings appear", async () => {
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        const user = userEvent.setup();
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});

        const [onButton, offButton] = getButtons(/Custom/);
        await user.click(offButton);
        expect(onButton).toBeVisible();
        expect(offButton).not.toBeVisible();
        expect(screen.queryByText(/Custom AND/)).toBeVisible();
    });

    test("Conditions for options to appear", async () => {
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        const user = userEvent.setup();
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        act(() => {store.dispatch(OpenHeaderPopup("expr_to_circuit"))});

        await user.selectOptions(screen.getByLabelText(/Output Component/), "Oscilloscope");
        expect(screen.queryByText(/Generate into IC/)).toBeNull();
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();

        await user.selectOptions(screen.getByLabelText(/Input Component/), "Clock");
        const [onButton, offButton] = getButtons(/Connect Clocks/);
        expect(onButton).not.toBeVisible();
        expect(offButton).toBeVisible();

        await user.selectOptions(screen.getByLabelText(/Input Component/), "Switch");
        expect(screen.queryByText(/Connect Clocks/)).toBeNull();
    });
});