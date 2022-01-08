import {CopyPasteEvent, Event} from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const PasteHandler = (paste: (text: string) => boolean): EventHandler => {
    return ({
        conditions: (event: Event) =>
            (event.type === "paste" &&
             (event.ev.clipboardData != undefined) &&
             (event.ev.clipboardData.getData("text/plain").length > 0)),

        getResponse: (_, {ev}: CopyPasteEvent) => {
            if (!ev.clipboardData)
                throw new Error("PasteHandler.getResponse failed: ev.clipboard is null");
            paste(ev.clipboardData.getData("text/plain"));
        }
    });
}
