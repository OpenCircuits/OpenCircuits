import {S_KEY} from "core/utils/Constants";
import {Input} from "core/utils/Input";

import {RemoteController} from "../controllers/RemoteController";

export class Shortcuts {
    public static async onKeyDown(input: Input, key: number, saveCircuit: () => void, downloadCircuit: () => void): Promise<void> {
        if (!(input.isModifierKeyDown() && key == S_KEY))
            return;

        const loggedIn = await RemoteController.IsLoggedIn();

        if (loggedIn)
            saveCircuit();
        else
            downloadCircuit();
    }
}