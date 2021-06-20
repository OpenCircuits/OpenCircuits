const termkit = require("terminal-kit");
const term = termkit.terminal;


module.exports = async function UI() {
    const QR_SIZE = 34;

    // term.setPalette("xterm");
    // term.setColor(14, 30, 30, 30, ["testcolor"]);

    term.clear();

    const spinner = await term.spinner();

    const document = term.createDocument({
        palette: new termkit.Palette(),
    });


    spinner.destroy();

    term.hideCursor();

    // Initialize layout
    new termkit.Layout({
        parent: document,
        boxChars: "lightRounded",
        layout: {
            widthPercent: 100, heightPercent: 100,
            rows: [{
                heightPercent: 100,
                columns: [
                    {
                        rows: [{
                            id: "box1-row1",
                            height: 3,
                            columns: [{ id: "box1_1" }]
                        }, {
                            id: "box1-row2",
                            columns: [{ id: "box1_2" }]
                        }]
                    },
                    {
                        rows: [{
                            id: "box2-row1",
                            height: 3,
                            columns: [{ id: "box2_1" }]
                        }, {
                            id: "box2-row2",
                            columns: [{ id: "box2_2" }]
                        }]
                    },
                    { id: "qrbox", width: QR_SIZE-1, percentHeight: 100 },
                ]
            }]
        },
    });

    // Box 1 (Frontend)
    new termkit.Text({
        parent: document.elements.box1_1,
        autoWidth: 1, autoHeight: 1,
        content: "Digital",
        leftPadding: " ",
        attr: { color: "blue" , bold: true },
    });
    const frontendBox = new termkit.TextBox({
        parent: document.elements.box1_2,
        scrollable: true, vScrollBar: true,
        contentHasMarkup: 'ansi',
        lineWrap: true,
        x: 0, y: 0,
        autoWidth: 1, autoHeight: 1,
        attr: {
            bgColor: 0,
        },
    });

    // Box 2 (Server)
    new termkit.Text({
        parent: document.elements.box2_1,
        autoWidth: 1, autoHeight: 1,
        content: "Server",
        leftPadding: " ",
        attr: { color: "blue" , bold: true },
    });
    const serverBox = new termkit.TextBox({
        parent: document.elements.box2_2,
        scrollable: true, vScrollBar: true,
        lineWrap: true,
        x: 0, y: 0,
        autoWidth: 1, autoHeight: 1,
        attr: {
            bgColor: 0,
        },
    });

    // QR Code window
    const window = new termkit.Window({
        parent: document.elements.qrbox,
        boxChars: "light",
        title: "^c^+Scan below^: to go to ^/site^:!",
        titleHasMarkup: true,
        movable: false,
        x: -1,
        width: QR_SIZE, height: QR_SIZE,
    });
    const qrCodeBox = new termkit.TextBox({
        parent: window,
        lineWrap: false, wordWrap: false,
        scrollable: true,
        autoWidth: 1, autoHeight: 1,
    });

    let onServerExitListener = (callback) => { callback(); };
    let onExitListener = (callback) => { callback(); };

    // Exit safely on q, Q, or CTRL+C
    function exit() {
        term.grabInput(false);
        term.hideCursor(false);
        term.styleReset();
        term.clear();

        let killCount = 0;
        const onKill = () => {
            killCount++;
            if (killCount === 2)
                process.exit();
        }

        onExitListener(onKill);
        onServerExitListener(onKill);
    }

    term.on("key", function(key) {
        if (key === "q" || key === "Q" || key === "CTRL_C")
            exit();
        if (key === "r" || key === "R") {
            // Kill currently running server
            onServerExitListener();
        }
    });
    ["exit", "SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM"].forEach((ev) =>
        process.on(ev, exit)
    );

    return {
        setQRCode: (code) => { qrCodeBox.setContent(code); },
        frontendBox,
        serverBox,
        setOnServerExitListener: (listener) => { onServerExitListener = listener; },
        setOnExitListener: (listener) => { onExitListener = listener; },
        destroy: () => {
            term.grabInput(false);
            term.hideCursor(false);
            term.styleReset();
            term.clear();
        },
    }
}
