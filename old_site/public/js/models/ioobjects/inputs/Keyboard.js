class Keyboard extends IOObject {
    constructor(context, x, y) {
        super(context, x, y, 3.5*DEFAULT_SIZE, 3.5*DEFAULT_SIZE/images["keyboard.svg"].ratio, images["keyboard.svg"], false, 0, 7);

        this.setOutputAmount(7);
        for (var i = 0; i < 7; i++) {
            var output = this.outputs[i];

            var l = -DEFAULT_SIZE/2*(i - 7/2 + 0.5);
            if (i === 0) l -= 1;
            if (i === 7-1) l += 1;

            output.setOrigin(V(l, 0));
            output.setTarget(V(l, -IO_PORT_LENGTH-(this.transform.size.y-DEFAULT_SIZE)/2));
            output.dir = V(0, -1);
        }
    }
    onKeyDown(code) {
        var code = Keyboard.codeMap[code];
        if (code == undefined)
            return;

        // Down bit
        this.activate(true, this.outputs.length-1);

        for (var i = this.outputs.length-2; i >= 0; i--) {
            var num = 1 << i;
            if (num > code) {
                this.outputs[i].activate(false);
            } else {
                this.outputs[i].activate(true);
                code -= num;
            }
        }
    }
    onKeyUp(code) {
        var code = Keyboard.codeMap[code];
        if (code == undefined)
            return;

        // Up bit
        this.activate(false, this.outputs.length-1);

        for (var i = this.outputs.length-2; i >= 0; i--) {
            this.outputs[i].activate(false);
            // var num = 1 << i;
            // if (num > code) {
            //     this.outputs[i].activate(false);
            // } else {
            //     this.outputs[i].activate(true);
            //     code -= num;
            // }
        }
    }
    getDisplayName() {
        return "Keyboard";
    }
}
Keyboard.getXMLName = function() { return "keyboard"; }
Importer.types.push(Keyboard);

Keyboard.codeMap = [];
Keyboard.codeCount = 0;

Keyboard.addKey = function(code) {
    Keyboard.codeMap[code] = (++Keyboard.codeCount);
}

// Add numbers 0-9
for (var code = 48; code <= 57; code++)
    Keyboard.addKey(code);

// Add letters a-z
for (var code = 65; code <= 90; code++)
    Keyboard.addKey(code);

Keyboard.addKey(32); // Space
Keyboard.addKey(13); // Enter
Keyboard.addKey(8); // Delete
Keyboard.addKey(9); // Tab
Keyboard.addKey(16); // LShift
Keyboard.addKey(17); // LCtrl
Keyboard.addKey(18); // LOption
Keyboard.addKey(91); // LCommand
Keyboard.addKey(20); // Caps lock
Keyboard.addKey(27); // Escape
Keyboard.addKey(192); // Tilda
Keyboard.addKey(189); // Minus
Keyboard.addKey(187); // Plus
Keyboard.addKey(219); // LBracket
Keyboard.addKey(221); // RBracket
Keyboard.addKey(220); // Backslash
Keyboard.addKey(186); // Semicolon
Keyboard.addKey(222); // Quote
Keyboard.addKey(188); // Comma
Keyboard.addKey(190); // Period
Keyboard.addKey(191); // Forwardslash
Keyboard.addKey(37); // Left
Keyboard.addKey(38); // Up
Keyboard.addKey(39); // Right
Keyboard.addKey(40); // Down
Keyboard.addKey(112); // F1
Keyboard.addKey(112); // F2

console.log(Keyboard.codeCount);
