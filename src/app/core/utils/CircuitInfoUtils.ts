import {Vector} from "Vector";

import {CalculateMidpoint} from "math/MathUtils";

import {AnyObj} from "core/models/types";

import {CircuitInfo} from "./CircuitInfo";


export function CalcSelectionsMidpoint(
    { camera, selections, viewManager }: CircuitInfo<AnyObj>,
    space: "screen" | "world",
): Vector {
    const midpoint =  CalculateMidpoint(
        selections.get()
            .map((id) => viewManager.getView(id).getMidpoint())
    );
    if (space === "world")
        return midpoint;
    return camera.getScreenPos(midpoint);
}

export function CalcWorldMousePos({ camera, input }: CircuitInfo<AnyObj>): Vector {
    return camera.getWorldPos(input.getMousePos());
}
