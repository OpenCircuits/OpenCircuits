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

Put your itemnav SVG file into the  site/public/img/icons folder, where you will see additional subfolders for each category of component.

Additionally, you'll need to add your component as an object in digitalnavconfig.json file. The `"id"` field should be the same `"id"` used in the `@serializable` tag in `YourComponentName.ts`. The `"label"` field is what is shown underneath the component in the itemnav, and in the `"icon"` field you should put the path to your itemnav SVG file name.  


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

Make it in site/public/img/items. Next, add your canvas SVG file name(s) to a variable called `IMAGE_FILE_NAMES` in app/digital/ts/utils/Images.ts .  


## TypeScript files
First create a new `YourComponentName.ts` file in the app/digital/ts/models/ioobjects . Implement the class in the TypeScript file. It's easiest to follow the example of an existing component, but here's what it should look like.

```typescript
@serializable("YourComponentID") // <- this must be the same "id" as in digital navconfig.json
export class YourComponent extends DigitalComponent {
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
Add this component to a list of `export`s in the app/digital/ts/models/ioobjects/index.ts .

```typescript
export {YourComponent} from "./YourComponent";
```

Second create any actions yor component might need in app/digital/actions/. Here is an example from 
`ClockFrequencyChangeAction.ts`

```typescript
export class ClockFrequencyChangeAction implements Action {
    private clock: Clock;

    private initialFreq: number;
    private targetFreq: number;

    public constructor(clock: Clock, targetFreq: number) {
        this.clock = clock;

        this.initialFreq = clock.getFrequency();
        this.targetFreq = targetFreq;
    }

    public execute(): Action {
        this.clock.setFrequency(this.targetFreq);

        return this;
    }

    public undo(): Action {
        this.clock.setFrequency(this.initialFreq);

        return this;
    }

}
```

Third create any SelectionPopupModules your component needs in site/pages/digital/src/containers/SelectionPopup/modules/. Here is 
an example from `OutputCountModule.tsx`
```typescript
const Config: ModuleConfig<[Encoder], number> = {
    types: [Encoder],
    valType: "int",
    getProps: (o) => o.getOutputPortCount().getValue(),
    getAction: (s, newCount) => new GroupAction(s.map(o =>
        new CoderPortChangeAction(o, o.getOutputPortCount().getValue(), newCount)))
}

export const OutputCountModule = PopupModule({
    label: "Output Count",
    modules: [CreateModule({
        inputType: "number",
        config: Config,
        step: 1, min: 2, max: 8,
        alt: "Number of outputs object(s) have"
    })]
});
```
Add your new PopupModules to src/site/pages/digital/src/containers/App/index.tsx 
(around line 114)
```typescript
modules={[PositionModule, InputCountModule,
        SelectPortCountModule,
        DecoderInputCountModule,
        OutputCountModule, SegmentCountModule,
        ClockFrequencyModule,
        ColorModule, TextColorModule,
        BusButtonModule, CreateICButtonModule,
        ViewICButtonModule, ClockSyncButtonModule, 
        YourModuleHere]} />

```

Lastly create any custom renderers your component needs in app/digital/rendering/ioobjects/FOLDER/YOUR_RENDERER.ts . 
Here is 
an example from `ConstantNumberRenderer.ts`
```typescript
export const ConstantNumberRenderer = (() => {

    // Function to draw the line connecting the 4 outputs
    const drawOutputConnector = function(renderer: Renderer, size: Vector, borderColor: string): void {
        const style = new Style(undefined, borderColor, DEFAULT_BORDER_WIDTH);
        // Y coordinates of the top and bottom
        const l1 = -(size.y/2)*(1.5);
        const l2 =  (size.y/2)*(1.5);
        // X coordinate to draw the vertical line
        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        renderer.draw(new Line(V(s, l1), V(s, l2)), style);
    }

    // Function to draw the input value on the component
    const drawInputText = function(renderer: Renderer, value: number): void {
        const text = value < 10 ? value.toString() : "ABCDEF".charAt(value - 10);
        renderer.text(text, V(0, 2.5), "center", DEFAULT_ON_COLOR, FONT_CONSTANT_NUMBER);
    }

    return {
        render(renderer: Renderer, object: ConstantNumber, selected: boolean): void {
            const transform = object.getTransform();
            const fillColor = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;

            const borderColor = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
            const style = new Style(fillColor, borderColor, DEFAULT_BORDER_WIDTH);

            // Draw the rectangle first, subtracting border width for alignment
            const rectSize = transform.getSize().sub(DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), rectSize), style);

            // Connect the output lines together and draw the text
            drawOutputConnector(renderer, transform.getSize(), borderColor);
            drawInputText(renderer, object.getInputNum());
        }
    };
})();
```

To add your custom render go to src/app/digital/rendering/ioobjects/ComponentRenderer.ts
change the following code to add your custom render

```typescript
    if (object instanceof Gate)
        GateRenderer.render(renderer, camera, object, selected);
    else if (object instanceof Multiplexer || object instanceof Demultiplexer)
        MultiplexerRenderer.render(renderer, camera, object, selected);
    else if (object instanceof SegmentDisplay)
        SegmentDisplayRenderer.render(renderer, camera, object, selected);
    else if (object instanceof IC)
        ICRenderer.render(renderer, camera, object, selected);
    else if (object instanceof FlipFlop || object instanceof Latch)
        drawBox(renderer, transform, selected);
    else if (object instanceof Encoder || object instanceof Decoder)
        drawBox(renderer, transform, selected);
    else if (object instanceof Your_Component)
        Your_ComponentRenderer.render(renderer, camera, object, selected);
```


## Checklist
- [ ] Itemnav SVG in icons folder
- [ ] Canvas SVG(s) in items folder
- [ ] Add object to digitalnavconfig.json
- [ ] Update `IMAGE_FILE_NAMES` in Images.ts
- [ ] Create TypeScript file
- [ ] Add export in index.ts
- [ ] Create new actions
- [ ] Create SelectionPopupModules
- [ ] Add your SelectionPopupModules in index.tsx
- [ ] Create custom renderers
- [ ] Add your custom renderers in ComponentRenderer.ts