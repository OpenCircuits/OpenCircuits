import {CopyPasteEvent, Event} from "core/utils/Events";

import {EventHandler} from "../EventHandler";


export const PasteHandler = (paste: (text: string) => boolean): EventHandler => ({
    conditions: (event: Event) =>
        (event.type === "paste" &&
            (!!event.ev.clipboardData) &&
            (event.ev.clipboardData.getData("text/plain").length > 0)),

    getResponse: (_, { ev }: CopyPasteEvent) => {
        paste(ev.clipboardData!.getData("text/plain"));
    },
});
