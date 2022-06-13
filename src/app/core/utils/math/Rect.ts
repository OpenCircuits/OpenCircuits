import {V, Vector} from "Vector";


// Turn union of keys to union of records with that key
type KeysToRecord<K> = K extends string ? Record<K, number> : never;

// Distribute each entry to an intersection of it with a new record of only new keys from `K`
type ExpandTypes<K, T> = T extends Record<string, number> ? (T & KeysToRecord<Exclude<K, keyof T>>) : never;

type XKeys = "left" | "right" | "cx" | "width";
type YKeys = "top" | "bottom" | "cy" | "height";

// A valid rectangle is the combination of any two of XKeys + any two of YKeys
type XRectProps = ExpandTypes<XKeys, KeysToRecord<XKeys>>;
type YRectProps = ExpandTypes<YKeys, KeysToRecord<YKeys>>;
type RectProps = (XRectProps) & (YRectProps);


export type Margin = {
    left?: number;
    right?: number;
    bottom?: number;
    top?: number;
}
export function Margin(left: number, right: number, bottom: number, top: number): Margin;
export function Margin(h: number, v: number): Margin;
export function Margin(left: number, right: number, bottom?: number, top?: number) {
    if (bottom !== undefined) {
        return { left, right, bottom, top };
    } else {
        const h = left, v = right;
        return { left: h, right: h, bottom: v, top: v };
    }
}


export class Rect {
    private yIsUp: number; // +1 or -1

    public left:   number;
    public right:  number;
    public top:    number;
    public bottom: number;

    public constructor(center: Vector, size: Vector, yIsUp = true) {
        this.yIsUp = (yIsUp ? +1 : -1);

        this.left   = center.x - size.x / 2;
        this.right  = center.x + size.x / 2;
        this.top    = center.y + this.yIsUp * size.y / 2;
        this.bottom = center.y - this.yIsUp * size.y / 2;
    }

    // Utility methods to update left/right/top/bottom as a 1-liner in set x/y/width/height
    private updateX(x: number, w: number) {
        this.left  = x - w / 2;
        this.right = x + w / 2;
    }
    private updateY(y: number, h: number) {
        this.top    = y + this.yIsUp * h / 2;
        this.bottom = y - this.yIsUp * h / 2;
    }

    public intersects(rect: Rect): boolean {
        return (
            rect.right  >= this.left  &&
            rect.left   <= this.right &&
            rect.top    <= this.top   &&
            rect.bottom >= this.bottom
        );
    }

    public contains(pt: Vector): boolean {
        return (
            pt.x <= this.right &&
            pt.x >= this.left  &&
            pt.y <= this.top   &&
            pt.y >= this.bottom
        );
    }

    public subMargin(margin: Margin) {
        const result = new Rect(this.center, this.size, (this.yIsUp === +1));
        result.left   += (margin.left   ?? 0);
        result.right  -= (margin.right  ?? 0);
        result.bottom += (margin.bottom ?? 0) * this.yIsUp;
        result.top    -= (margin.top    ?? 0) * this.yIsUp;
        return result;
    }

    /**
     * Performs a rectangle subtraction (essentially a XOR), see
     *   https://stackoverflow.com/questions/3765283/how-to-subtract-a-rectangle-from-another
     * This method works slightly differently by instead of calculating the minimum rectangles for the subtraction,
     *  calculates all possible 8 rectangles from each side and corner
     *
     * @param rect Rectangle to subtract from this rectangle
     * @returns The remaining rectangles after the subtraction
     */
    public sub(rect: Rect): Rect[] {
        if (!this.intersects(rect))
            return [];

        return [
            Rect.from({ left: this.left,  right: rect.left,  top: this.top,    bottom: rect.top    }),
            Rect.from({ left: this.left,  right: rect.left,  top: rect.top,    bottom: rect.bottom }),
            Rect.from({ left: this.left,  right: rect.left,  top: rect.bottom, bottom: this.bottom }),
            Rect.from({ left: rect.left,  right: rect.right, top: this.top,    bottom: rect.top    }),
            Rect.from({ left: rect.left,  right: rect.right, top: rect.bottom, bottom: this.bottom }),
            Rect.from({ left: rect.right, right: this.right, top: this.top,    bottom: rect.top    }),
            Rect.from({ left: rect.right, right: this.right, top: rect.top,    bottom: rect.bottom }),
            Rect.from({ left: rect.right, right: this.right, top: rect.bottom, bottom: this.bottom }),
        ].filter(r => r.width > 0 && r.height > 0);
    }

    /**
     * Shifts the sides of this rectangle given by amt
     *  if dir.x < 0, shifts amt.x left
     *  if dir.x > 0, shifts amt.x right
     *  if dir.y < 0, shifts amt.y down
     *  if dir.y > 0, shifts amt.y up
     *
     * @param dir The direction to shift this rectangle
     * @param amt The amount to shift this rectangle
     * @returns A new rectangle which is a shifted version of this one
     */
    public shift(dir: Vector, amt: Vector): Rect {
        return Rect.from({
            left:   this.left   + (dir.x < 0 ? amt.x * dir.x : 0),
            right:  this.right  + (dir.x > 0 ? amt.x * dir.x : 0),
            top:    this.top    + (dir.y > 0 ? amt.y * dir.y : 0),
            bottom: this.bottom + (dir.y < 0 ? amt.y * dir.y : 0),
        });
    }

    public set x(x: number) {
        this.updateX(x, this.width);
    }
    public set y(y: number) {
        this.updateY(y, this.height);
    }
    public set width(w: number) {
        this.updateX(this.x, w);
    }
    public set height(h: number) {
        this.updateY(this.y, h);
    }

    public get x() {
        return (this.right + this.left) / 2;
    }
    public get y() {
        return (this.top + this.bottom) / 2;
    }
    public get width() {
        return (this.right - this.left);
    }
    public get height() {
        return this.yIsUp * (this.top - this.bottom);
    }

    public set topLeft(tL: Vector) {
        this.left = tL.x;
        this.top = tL.y;
    }
    public set topRight(tR: Vector) {
        this.right = tR.x;
        this.top = tR.y;
    }
    public set bottomLeft(bL: Vector) {
        this.left = bL.x;
        this.bottom = bL.y;
    }
    public set bottomRight(bR: Vector) {
        this.right = bR.x;
        this.bottom = bR.y;
    }

    public get topLeft() {
        return V(this.left, this.top);
    }
    public get topRight() {
        return V(this.right, this.top);
    }
    public get bottomLeft() {
        return V(this.left, this.bottom);
    }
    public get bottomRight() {
        return V(this.right, this.bottom);
    }

    public get center() {
        return V(this.x, this.y);
    }
    public get size() {
        return V(this.width, this.height);
    }

    /**
     * Utility method to create a rectangle from any combination of valid rectangle attributes, i.e. allows
     *  specification of size + center, or bottom left + top right, or any other valid combination.
     *
     * @param bounds Attributes of rectangle
     * @param yIsUp Whether this rectangle has +y or -y
     * @returns A Rect from the given bounds/attributes and yIsUp direction
     */
    public static from(bounds: RectProps, yIsUp = true): Rect {
        type BoundKeys = "min" | "max" | "center" | "size";
        type BoundProps = ExpandTypes<BoundKeys, KeysToRecord<BoundKeys>>;

        // Generalized "center" and "size" methods to apply for both x/y directions
        const GetCenter = (b: BoundProps) => (
            "center" in b
                ? b.center
                : ("min" in b
                    ? ("max" in b
                        ? ((b.max + b.min) / 2)
                        : (b.min + b.size / 2))
                    : (b.max - b.size / 2))
        );
        const GetSize = (b: BoundProps) => (
            "size" in b
                ? b.size
                : ("min" in b
                    ? ("max" in b
                        ? (b.max - b.min)
                        : (2 * (b.center - b.min)))
                    : (2 * (b.max - b.center)))
        );

        // Get "bounds" for each direction
        const boundsX = {
            ...("left"  in bounds ? { min:    bounds.left  } : {}),
            ...("right" in bounds ? { max:    bounds.right } : {}),
            ...("cx"    in bounds ? { center: bounds.cx    } : {}),
            ...("width" in bounds ? { size:   bounds.width } : {}),
        } as BoundProps;
        const boundsY = {
            ...("bottom" in bounds ? { min:    bounds.bottom } : {}),
            ...("top"    in bounds ? { max:    bounds.top    } : {}),
            ...("cy"     in bounds ? { center: bounds.cy     } : {}),
            ...("height" in bounds ? { size:   bounds.height } : {}),
        } as BoundProps;

        return new Rect(
            V(
                GetCenter(boundsX),
                GetCenter(boundsY) * (yIsUp ? +1 : -1)
            ),
            V(GetSize(boundsX), GetSize(boundsY)),
            yIsUp
        );
    }
}
