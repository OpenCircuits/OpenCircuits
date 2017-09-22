class Popup {
    constructor(divName) {
        this.div = document.getElementById(divName);
        this.div.style.position = "absolute";
        this.focused = false;

        this.modules = [];

        this.setPos(V(0,0));
        this.hide();
    }
    add(m) {
        this.modules.push(m);
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
        this.onShow();
    }
    hide() {
        this.hidden = true;
        this.div.style.visibility = "hidden";
    }
    setPos(v) {
        this.pos = V(v.x, v.y);
        this.clamp();

        this.div.style.left = this.pos.x + "px";
        this.div.style.top = this.pos.y + "px";
    }
    clamp() {
        this.pos.x = Math.max(Math.min(this.pos.x, window.innerWidth -this.div.clientWidth -1), isSidebarOpen ? SIDEBAR_WIDTH+5 : 5);
        this.pos.y = Math.max(Math.min(this.pos.y, window.innerHeight-this.div.clientHeight-1), toolBar.clientHeight+5);
    }
}
