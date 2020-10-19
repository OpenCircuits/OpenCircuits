import {Input} from "core/utils/Input";
import {S_KEY} from "core/utils/Constants";
import {MainDesignerController} from "./MainDesignerController";
import {LoginController} from "site/shared/controllers/LoginController";
import {RemoteController} from "site/shared/controllers/RemoteController";
import {addSetSavedCallback, setSAVED} from "core/utils/Config";
import {HeaderController} from "site/shared/controllers/HeaderController";

export class Saveshortcuts
{
    public save_shortcut(main: MainDesignerController, input: Input, key?: number, log: LoginController, head: HeaderController): boolean
    {                                                    //todo: implpent isLoggedin()
        if (input.isModifierKeyDown() && key == S_KEY && isLoggedin()) {
            const data = main.saveCircuit();
            RemoteController.SaveCircuit(data, async () => {
                // set saved to   true (which calls callbacks to set the button as invisible)
                setSAVED(true);
                //sidenav is private so I need a different way to do this
                return log.sidenav.updateUserCircuits();
            });
            return true
        }                                              //todo: implpent isLoggedout()
        else if(input.isModifierKeyDown() && key == S_KEY && isLoggedout()){
            head.onSaveCircuit(main);
            return true
        }
        
        return false
    }
}