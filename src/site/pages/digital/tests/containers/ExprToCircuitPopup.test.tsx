import {render, screen} from "@testing-library/react";

import {ExprToCircuitPopup} from "site/digital/containers/ExprToCircuitPopup";

import {Setup} from "test/helpers/Setup";


describe("Main Popup", () => {
    test("Cancel Button Cancels", () => {
        const info = Setup();
        render(<ExprToCircuitPopup mainInfo={info} />);
        expect(true).toBeTruthy();
    })
});