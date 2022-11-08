import {CopyPasteInputEvent, InputManagerEvent} from "core/utils/InputManager";

import {EventHandler} from "../EventHandler";


export const PasteHandler = (paste: (text: string) => boolean): EventHandler => ({
    conditions: (event: InputManagerEvent) =>
        (event.type === "paste" &&
            (!!event.ev.clipboardData) &&
            (event.ev.clipboardData.getData("text/plain").length > 0)),

    getResponse: (_, { ev }: CopyPasteInputEvent) => {
        paste(ev.clipboardData!.getData("text/plain"));
    },
});
