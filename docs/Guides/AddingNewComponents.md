---
title: Adding new Components
---

Each component has at least two SVG files to display. One of these is the one shown in the item navigation bar where you drag components from, and the other(s) are shown on the canvas when dragged and dropped.


## Itemnav SVG file
The itemnav SVG looks like this:
```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30">
<path d=" INPUT PATH HERE "
stroke="black" stroke-width="1" stroke-linecap="round" fill="none"></path>
</svg>
```

I like to use [this editor/viewer from rapidtables](https://www.rapidtables.com/web/tools/svg-viewer-editor.html) because it is straightforward unlike a lot of other SVG editors out there. Copy the code above into there and modify `INPUT PATH HERE` to be the actual path ([read up on paths here](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)). Some icons require more than just a path (i.e. circles and other neat shapes). You can edit these however you like, this is just some starter code.

If you're making an analog component, put your itemnav SVG file into the site/public/img/analog/icons folder, where you will see additional subfolders for each category of component. For digital, site/public/img/icons.  

Additionally, you'll need to add your component as an object in either the analognavconfig.json or the digitalnavconfig.json file. Remember what you put in the `"id"` field, this will be important later. The `"label"` field is what is shown underneath the component in the itemnav, and the `"icon"` field is where you put your itemnav SVG file name.  


## Canvas SVG file(s)
If your component is `Pressable`, which means you should be able to click on it to change its behavior (e.g. a switch or button), then you will need to create multiple SVG files. If not, then only one is required. These are similar to the itemnav SVG files:
```svg
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="10.5px" viewbox = "24 9.75 17 10.5">
<path d=" INPUT PATH HERE "
stroke="black" stroke-width="1" stroke-linecap="round" fill="none"></path>
</svg>
```

Your path and dimensions may vary from the itemnav tool. When in doubt, take a look at existing component SVGs as examples. The main difference here is the `viewBox` which defines the area of the icon which is to be visible. The height and width should be at least the same ratio as those defined in your component's TypeScript file, which we will get to later.  

For analog components, make this SVG file in site/public/img/analog/items, if digital make it in site/public/img/items. Next, add your canvas SVG file name(s) to a variable called `IMAGE_FILE_NAMES` in app/analog/ts/utils/Images.ts (for digital, app/digital/ts/utils/Images.ts).  


## TypeScript file
Make a new `YourComponentName.ts` file in the app/analog/ts/models/eeobjects folder (for digital, app/digital/ts/models/ioobjects). Implement the class in the TypeScript file. It's easiest to follow the example of an existing component, but here's what it should look like.

```typescript
@serializable("YourComponentID") // <- this must be the same "id" as in analog/digital navconfig.json
export class YourComponent extends AnalogComponent {
    public constructor( /* arguments */ ) {
        super(new ClampedValue(NUMBER OF PORTS), V(WIDTH, HEIGHT));
         // more code ...
    }

    public getDisplayName(): string {
        return "YourComponentName";
    }

    // name of the canvas icon, not the itemnav svg
    public getImageName(): string {
        return "yourcomponent.svg";
    }

    // other necessary methods ...
```

Lastly, add this component to a list of `export`s in the app/analog/ts/models/eeobjects/index.ts (for digital, app/digital/ts/models/ioobjects/index.ts).

```typescript
export {YourComponent} from "./YourComponent";
```


## Checklist
- [ ] Itemnav SVG in icons folder
- [ ] Canvas SVG(s) in items folder
- [ ] Add object to analognavconfig.json or digitalnavconfig.json
- [ ] Update `IMAGE_FILE_NAMES` in Images.ts
- [ ] Make TypeScript file
- [ ] Add export in index.ts
