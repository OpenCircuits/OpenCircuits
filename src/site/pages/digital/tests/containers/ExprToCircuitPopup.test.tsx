import "@testing-library/jest-dom";
import {Matcher, act, render, screen} from "@testing-library/react";
import userEvent                      from "@testing-library/user-event";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {Setup} from "test/helpers/Setup";

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
        const switchInputOption = [...inputOptions].find((input) => input.text === "Switch")
        expect(switchInputOption?.selected).toBeTruthy();
        const outputOptions = screen.getByLabelText(/Output Component/).querySelectorAll("option");
        const ledOutputOption = [...outputOptions].find((input) => input.text === "LED")
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

        await user.click(screen.getByText("Cancel"));
        expect(screen.getByText("Cancel")).not.toBeVisible();
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeVisible();
    })
});