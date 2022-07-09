import "@testing-library/jest-dom";
import {fireEvent, render, screen}    from "@testing-library/react";
import userEvent                      from "@testing-library/user-event";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {Setup} from "test/helpers/Setup";

import {AppState} from "site/digital/state";

import {AllActions} from "site/digital/state/actions";
import {reducers}   from "site/digital/state/reducers";

import {ExprToCircuitPopup} from "site/digital/containers/ExprToCircuitPopup";



describe("Main Popup", () => {
    test("Cancel Button Cancels", async () => {
        const info = Setup();
        const user = userEvent.setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        expect(true).toBeTruthy();
        expect(screen.getByText("Digital Expression To Circuit Generator")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        await user.click(screen.getByText("Cancel"));
        expect(screen.getByText("Cancel")).not.toBeInTheDocument();
        expect(screen.getByText("Digital Expression To Circuit Generator")).not.toBeInTheDocument();
    })
});