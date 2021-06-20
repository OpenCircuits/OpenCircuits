const qrcode = require("qrcode-terminal");


module.exports = async function genQR(url) {
    return new Promise((resolve) => {
        qrcode.generate(url, {small: true}, (qrcode) => {
            const h = qrcode.split("\n").length+1;
            const w = 2*(h-1);
            resolve({ w, h, qrcode });
        });
    });
}
