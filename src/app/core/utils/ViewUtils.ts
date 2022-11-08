import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {AnyObj} from "core/models/types";

import {CircuitInfo} from "./CircuitInfo";


// Find a minimal bounding box enclosing all cullable objects in a given array
// Note that if the array is empty, min and max will both be (0, 0)
export function CircuitBoundingBox({ viewManager }: CircuitInfo<AnyObj>, objs: AnyObj[]): Rect {
    const views = objs.map((o) => viewManager.getView(o.id));

    const min = Vector.Min(...views.map((v) => v.getCullbox().getBottomLeft()));
    const max = Vector.Max(...views.map((v) => v.getCullbox().getTopRight()));

    return Rect.FromPoints(min, max);
}

/**
 * Calculates camera position and zoom to fit objs to
 * the camera's view with adjustable padding. If objs
 * is empty, uses a default size.
 *
 * @param info    The circuit info.
 * @param objs    The objects to fit within the camera.
 * @param padding The amount of padding for the fit.
 * @returns       Tuple of desired camera position and zoom.
 */
export function GetCameraFit(info: CircuitInfo<AnyObj>, objs: AnyObj[], padding: number): [Vector, number] {
    const { camera } = info;

    // If no objects return to default zoom
    if (objs.length === 0)
        return [V(), 1];

    const { left, right, bottom, top } = camera.getMargin();

    const marginSize = V(left - right, top - bottom);

    const bbox = CircuitBoundingBox(info, objs);

    const screenSize = camera.getSize().sub(V(left, bottom)); // Bottom right corner of screen
    const worldSize = camera.getWorldPos(screenSize).sub(camera.getWorldPos(V(0,0))); // World size of camera view

    // Determine which bbox dimension will limit zoom level
    const ratio = V(bbox.width / worldSize.x, bbox.height / worldSize.y);
    const finalZoom = camera.getZoom()*Math.max(ratio.x, ratio.y)*padding;

    // Only subtract off 0.5 of the margin offset since currently it's centered on the margin'd
    //  screen size so only half of the margin on the top/left need to be contributed
    const finalPos = bbox.center.sub(marginSize.scale(0.5 * finalZoom));

    return [finalPos, finalZoom];
}
