import {Browser} from "core/utils/Browser";
import { type } from "os";

type compatible = {
    react_v: boolean;
    canvas_v:boolean;
}

var COMPATIBILITY = {
    CHROME: {
        react_v: "49",
        canvas_v: "94"
    },
    FIREFOX: {
        react_v: "49",
        canvas_v: "93"  
    },
    SAFARI: { 
        react_v: "49",
        canvas_v: "93"  
    },
    IE: {
        react_v: "49",
        canvas_v: "93"
    }
}

export function in_range(value: String, min:string): boolean {
    return value >= min;
};

export function compatibility_check() : compatible {
    var ans:compatible = {react_v: false, canvas_v: false};
    if(Browser.name == "Chrome") {
        if(in_range(Browser.version, COMPATIBILITY.CHROME.react_v)) {
            console.log("Inside chrome function");
            ans.react_v = true;
        }
        if(in_range(Browser.version, COMPATIBILITY.CHROME.canvas_v)) {
            console.log("Inside chrome function");
            ans.canvas_v = true;
        }
    }
    else if(Browser.name == "FIREFOX") {
        if(in_range(Browser.version, COMPATIBILITY.FIREFOX.react_v)) {
            ans.react_v = true;
        }
        if(in_range(Browser.version, COMPATIBILITY.FIREFOX.canvas_v)) {
            ans.canvas_v = true;
        }
    }
    else if(Browser.name == "SAFARI") {
        if(in_range(Browser.version, COMPATIBILITY.SAFARI.react_v)) {
            ans.react_v = true;
        }
        if(in_range(Browser.version, COMPATIBILITY.SAFARI.canvas_v)) {
            ans.canvas_v = true;
        }
    }
    else if(Browser.name == "IE") {
        if(in_range(Browser.version, COMPATIBILITY.IE.react_v)) {
            ans.react_v = true;
        }
        if(in_range(Browser.version, COMPATIBILITY.IE.canvas_v)) {
            ans.canvas_v = true;
        }
    }
    return ans;
    

}


export function warn_compatibility() {
    var ans = compatibility_check();
    if(!ans.react_v) {
        alert("Your browser is not compatible with React. Please update your browser to version " + COMPATIBILITY.CHROME.react_v + " or higher");
    }
    if(!ans.canvas_v) {
        alert("Your browser is not compatible with Canvas. Please update your browser to version " + COMPATIBILITY.CHROME.canvas_v + " or higher");
    }
}



