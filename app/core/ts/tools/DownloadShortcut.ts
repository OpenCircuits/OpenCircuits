import {Input} from "core/utils/Input";
import {S_KEY} from "core/utils/Constants";
import {MainDesignerController} from "site/shared/controllers/MainDesignerController";
import {LoginController} from "site/shared/controllers/LoginController";
import {RemoteController} from "site/shared/controllers/RemoteController";
import {addSetSavedCallback, setSAVED} from "core/utils/Config";
import {HeaderController} from "site/shared/controllers/HeaderController";
import {SaveFile} from "site/shared//utils/Exporter";
export function DownloadShortcut(main: MainDesignerController, project_name: string, input: Input, key?: number): boolean
{
    
    const promise = new Promise((resolve,reject) =>{
       resolve(RemoteController.IsLoggedIn());
    });
    promise.then((isloggedin) =>{
        if(input.isModifierKeyDown() && key == S_KEY && !isloggedin){
            SaveFile(main.saveCircuit(false),project_name);
            return true;
        }
    });
    
    
    return false;
}