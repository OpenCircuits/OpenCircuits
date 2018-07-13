var assert = require('assert');

class DOMTestingObject {
    constructor(id, w, h) {
        this.id = id;
        this.width = (w ? w : 0);
        this.height = (h ? h : 0);
        this.listeners = [];
        this.children = [];
        this.style = {position: '', left: '', top: '', visibility: ''}
        this.focused = false;
    }
    addEventListener(l) {
        this.listeners.push(l);
    }
    addElement(el) {
        this.children.push(el);
    }
    createElement(id) {
        var obj = new DOMTestingObject(id);
        this.children.push(obj);
        return obj;
    }
    getElementById(id) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].id === id)
                return this.children[i];
        }
        return new DOMTestingObject(id);
    }
    getContext() { return {}; }
    blur() { this.focused = false; }
    focus() { this.focused = true; }
}

class Image {
    constructor() {
        this._src = "";
        this.width = 1;
        this.height = 1;
        this.onload = function() {};
    }
    set src(s) {
        this._src = s;
        this.onload();
    }
    get src() {
        return this._src;
    }
}

var window = new DOMTestingObject("window", 0, 0);
var document = new DOMTestingObject("document", 0, 0);
var navigator = undefined;
var header = undefined;
document.addElement(new DOMTestingObject("canvas", 100, 100));
document.addElement(new DOMTestingObject("designer-canvas", 100, 100));

function requestAnimationFrame() {}
