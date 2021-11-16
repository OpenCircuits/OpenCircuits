import {Browser} from "core/utils/Browser";

type Compatible = {
    ReactVersion: boolean;
    CanvasVersion:boolean;
}

var COMPATIBILITY = {
    Chrome: {
        ReactVersion: 49,
        CanvasVersion: 94
    },
    Firefox: {
        ReactVersion: 48,
        CanvasVersion: 93  
    },
    Safari: { 
        ReactVersion: 49,
        CanvasVersion: 93  
    },
    InternetExplorer: {
        ReactVersion: 49,
        CanvasVersion: 93  
    }
} as Record<string, {ReactVersion: number, CanvasVersion: number}>;

export function CompatibilityCheck(){
    const ans:Compatible = {ReactVersion: false, CanvasVersion: false};

    parseFloat(Browser.version) >= COMPATIBILITY[Browser.name].ReactVersion
        ? ans.ReactVersion = true
        : ans.ReactVersion = false;

    parseFloat(Browser.version) >= COMPATIBILITY[Browser.name].CanvasVersion
        ? ans.CanvasVersion = true
        : ans.CanvasVersion = false;

    if(!ans.ReactVersion) {
        alert(`Your browser is not compatible with React. Please update your browser to Version ${COMPATIBILITY[Browser.name].ReactVersion} or higher`);
    }
    if(!ans.CanvasVersion) {
        alert(`Your browser is not compatible with React. Please update your browser to Version ${COMPATIBILITY[Browser.name].CanvasVersion} or higher`);
    }
}   





