export var Images = (function() {
    var images: Map<string, HTMLImageElement> = new Map();

    var loadImages = function(imageNames: Array<string>,
                              onFinish: () => void): void {
        // Load each image
        let index = 0;
        for (let imageName of imageNames) {
            let img = new Image();
            img.onload = function() {
                if (++index === imageNames.length)
                    onFinish();
            };
            img.src = "img/items/" + imageName;
            images.set(imageName, img);
        }
    }

    return {
        Load: function(onFinishLoading: () => void): void {
            loadImages(
                ["constLow.svg", "constHigh.svg",
                 "buttonUp.svg", "buttonDown.svg",
                 "switchUp.svg", "switchDown.svg",
                 "led.svg", "ledLight.svg",
                 "buf.svg", "and.svg", "or.svg",
                 "segment1.svg", "segment2.svg",
                 "segment3.svg", "segment4.svg",
                 "clock.svg", "clockOn.svg",
                 "keyboard.svg", "base.svg"], onFinishLoading);
        },
        GetImage: function(img: string): HTMLImageElement {
            return images.get(img);
        }
    };
})();
