"use strict";

// 

var Images = function () {
    var images = [];

    var loadImages = function (imageNames, index, onFinish) {
        var img = new Image(); //Object.create(Image);
        img.onload = function () {
            images[imageNames[index]] = img;
            img.dx = 0;
            img.dy = 0;
            img.ratio = img.width / img.height;
            if (index === imageNames.length - 1) onFinish();else loadImages(imageNames, index + 1, onFinish);
        };
        img.src = "img/items/" + imageNames[index];
        console.log(img.src);
    };

    return {
        Load: function (onFinishLoading) {
            loadImages(["constLow.svg", "constHigh.svg", "buttonUp.svg", "buttonDown.svg", "switchUp.svg", "switchDown.svg", "led.svg", "ledLight.svg", "buffer.svg", "and.svg", "or.svg", "xor.svg", "segment1.svg", "segment2.svg", "segment3.svg", "segment4.svg", "clock.svg", "clockOn.svg", "keyboard.svg", "base.svg"], 0, onFinishLoading);
        },
        GetImage: function (img) {
            return images[img];
        }
    };
}();

module.exports = Images;