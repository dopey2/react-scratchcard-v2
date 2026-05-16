type BrushCircle = {
    type: "circle",
    radius: number;
}

type BrushImage = {
    type: "image",
    image: string;
    width: number;
    height: number;
}

export type Brush = BrushCircle | BrushImage;


export const Brushes = {
    circle: (radius: number): BrushCircle => ({
        type: 'circle',
        radius
    }),
    image: (image: string, width: number, height: number): BrushImage => ({
        type: 'image',
        image,
        width,
        height
    }),
};