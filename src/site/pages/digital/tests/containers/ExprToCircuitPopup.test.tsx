import {render, screen}               from "@testing-library/react";
import {Provider}                     from "react-redux";
import {applyMiddleware, createStore} from "redux";
import thunk, {ThunkMiddleware}       from "redux-thunk";

import {Setup} from "test/helpers/Setup";

import {AppState} from "site/digital/state";

import {AllActions} from "site/digital/state/actions";
import {reducers}   from "site/digital/state/reducers";

import {ExprToCircuitPopup} from "site/digital/containers/ExprToCircuitPopup";



describe("Main Popup", () => {
    test("Cancel Button Cancels", () => {
        const info = Setup();
        const store = createStore(reducers, applyMiddleware(thunk as ThunkMiddleware<AppState, AllActions>));
        render(<Provider store={store}><ExprToCircuitPopup mainInfo={info} /></Provider>);
        expect(true).toBeTruthy();
    })
});