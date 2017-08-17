class Clock extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 60, 60/images["clock.svg"].ratio, images["clock.svg"], false, 0, 1);
        this.frequency = 1000;
        setTimeout(() => this.tick(), this.frequency);
    }
    tick() {
        this.activate(!this.isOn);
        setTimeout(() => this.tick(), this.frequency);
    }
    activate(on) {
        super.activate(on);
        this.img = (on ? images["clockOn.svg"] : images["clock.svg"]);
        render();
    }
    getDisplayName() {
        return "Clock";
    }
}
Clock.getXMLName = function() { return "clock"; }
Importer.types.push(Clock);
