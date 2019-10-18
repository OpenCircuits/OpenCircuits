export const Images = (() => {
    const IMAGE_FILE_NAMES = ["voltagesource.svg", "currentsource.svg",
                              "resistor.svg"];

    const images: Map<string, HTMLImageElement> = new Map();

    const loadImage = function(imageName: string, resolve: (num?: number) => void): void {
        const img = new Image();
        img.onload = () => resolve(1);
        img.onabort = img.onerror = (e) => console.error(e);
        img.src = "img/analog/items/" + imageName;
        images.set(imageName, img);
    }

    return {
        GetImage: function(img: string): HTMLImageElement {
            return images.get(img);
        },
        Load: async function(): Promise<void> {
            const promises =
                IMAGE_FILE_NAMES.map((name) =>
                    new Promise((resolve, _) => loadImage(name, resolve))
                );

            await Promise.all(promises);
        }
    };
})();
