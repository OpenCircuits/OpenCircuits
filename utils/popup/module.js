class Module {
    constructor(parent, divName, divTextName) {
        this.parent = parent;
        this.div = document.getElementById(divName);
        this.divtext = (divTextName ? document.getElementById(divTextName) : undefined);
        this.div.oninput = () => { render(); this.onChange(); };
        this.div.onclick = () => this.onClick();
        this.div.onfocus = () => this.onFocus();
        this.div.onblur =  () => this.onBlur();
    }
    blur() {
        this.div.blur();
    }
    onShow() {}
    setValue(val) {
        this.div.value = val;
    }
    setPlaceholder(val) {
        this.div.placeholder = val;
    }
    setVisibility(val) {
        this.div.style.display = val;
        if (this.divtext != undefined)
            this.divtext.style.display = val;
    }
    setDisabled(val) {
        this.div.disabled = val;
    }
    getValue() {
        return this.div.value;
    }
    onChange() {}
    onClick() {}
    onFocus() {
        this.parent.focused = true;
    }
    onBlur() {
        this.parent.focused = false;
    }
}
