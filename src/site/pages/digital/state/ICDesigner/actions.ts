import {OPEN_IC_DESIGNER_ID, CLOSE_IC_DESIGNER_ID} from "./actionTypes";
import {ICData} from "digital/models/ioobjects/other/ICData";

export type OpenICDesignerAction = {
    type: typeof OPEN_IC_DESIGNER_ID;
    data: ICData;
}
export type CloseICDesignerAction = {
    type: typeof CLOSE_IC_DESIGNER_ID;
    cancelled: boolean;
}

export const OpenICDesigner = (data: ICData) => ({
    type: OPEN_IC_DESIGNER_ID, data
}) as OpenICDesignerAction;
export const CloseICDesigner = (cancelled: boolean = false) => ({
    type: CLOSE_IC_DESIGNER_ID,
    cancelled
}) as CloseICDesignerAction;

export type ICDesignerActions =
    OpenICDesignerAction |
    CloseICDesignerAction;
