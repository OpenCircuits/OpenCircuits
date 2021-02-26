import {OPEN_IC_VIEWER_ID, CLOSE_IC_VIEWER_ID} from "./actionTypes";
import {ICData} from "digital/models/ioobjects/other/ICData";

export type OpenICViewerAction = {
    type: typeof OPEN_IC_VIEWER_ID;
    data: ICData;
}
export type CloseICViewerAction = {
    type: typeof CLOSE_IC_VIEWER_ID;
    cancelled: boolean;
}

export const OpenICViewer = (data: ICData) => ({
    type: OPEN_IC_VIEWER_ID, data
}) as OpenICViewerAction;
export const CloseICViewer = (cancelled: boolean = false) => ({
    type: CLOSE_IC_VIEWER_ID,
    cancelled
}) as CloseICViewerAction;

export type ICViewerActions =
    OpenICViewerAction |
    CloseICViewerAction;
