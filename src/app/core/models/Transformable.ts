

export type Transformable = {
    x: number;
    y: number;
    angle: number;
}

export const DefaultTransform = (): Transformable => ({ x: 0, y: 0, angle: 0 });
