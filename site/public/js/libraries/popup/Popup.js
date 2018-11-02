class Popup {
    constructor(divName) {
        this.div = document.getElementById(divName);
        this.div.addEventListener('keydown', e => {this.onKeyDown(e.keyCode);}, false);
        this.div.addEventListener('keyup', e => {this.onKeyUp(e.keyCode);}, false);
        this.div.style.position = "absolute";
        this.focused = false;

        this.modules = [];

        this.setPos(V(0,0));
        this.hide();
    }
    onKeyDown(code) {
    }
    onKeyUp(code) {
    }
    add(m) {
        this.modules.push(m);
    }
    update() {
        this.onShow();
    }
    onShow() {
        for (var i = 0; i < this.modules.length; i++)
            this.modules[i].onShow();
    }
    blur() {
        for (var i = 0; i < this.modules.length; i++)
            this.modules[i].blur();
    }
    show() {
        this.hidden = false;
        this.div.style.visibility = "visible";
        this.div.focus();
        this.onShow();
    }
    hide() {
        this.hidden = true;
        this.div.style.visibility = "hidden";
        this.div.blur();
    }
    setPos(v) {
        this.pos = V(v.x, v.y);
        this.clamp();

        this.div.style.left = this.pos.x + "px";
        this.div.style.top = this.pos.y + "px";
    }
    clamp() {
        this.pos.x = Math.max(Math.min(this.pos.x, window.innerWidth -this.div.clientWidth -1), ItemNavController.isOpen ? ITEMNAV_WIDTH+5 : 5);
        this.pos.y = Math.max(Math.min(this.pos.y, window.innerHeight-this.div.clientHeight-1), (header ? header.clientHeight : 0)+5);
    }
}
