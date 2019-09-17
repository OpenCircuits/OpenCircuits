export const Images = (() => {
    const IMAGE_FILE_NAMES = ["constLow.svg", "constHigh.svg",
                              "buttonUp.svg", "buttonDown.svg",
                              "switchUp.svg", "switchDown.svg",
                              "led.svg", "ledLight.svg",
                              "buf.svg", "and.svg", "or.svg",
                              "segment1.svg", "segment2.svg",
                              "segment3.svg", "segment4.svg",
                              "clock.svg", "clockOn.svg",
                              "keyboard.svg", "base.svg"];

    const images: Map<string, HTMLImageElement> = new Map();

    const loadImage = function(imageName: string, resolve: (num?: number) => void): void {
        const img = new Image();
        img.onload = () => resolve(1);
        img.src = "img/items/" + imageName;
        images.set(imageName, img);
    }

    return {
        GetImage: function(img: string): HTMLImageElement {
            return images.get(img);
        },
        Load: function(onFinishLoading: () => void): void {
            const promises =
                IMAGE_FILE_NAMES.map((name) =>
                    new Promise((resolve, _) => loadImage(name, resolve))
                );

            Promise.all(promises).then(() => {
                onFinishLoading();
            });
        }
    };
})();
