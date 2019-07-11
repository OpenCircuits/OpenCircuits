export const Images = (() => {
    const images: Map<string, HTMLImageElement> = new Map();

    const loadImages = function(imageNames: Array<string>,
                                onFinish: () => void): void {
        // Load each image
        let index = 0;
        for (const imageName of imageNames) {
            const img = new Image();
            img.onload = () => {
                if (++index === imageNames.length)
                    onFinish();
            };
            img.src = "img/items/" + imageName;
            images.set(imageName, img);
        }
    }

    return {
        GetImage: function(img: string): HTMLImageElement {
            return images.get(img);
        },
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
        }
    };
})();
