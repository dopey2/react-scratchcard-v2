type CoverImage = {
    type: "image",
    image: string;
}

type CoverColor = {
    type: "color",
    color: string;
}

export type Cover = CoverImage | CoverColor;


export const Covers = {
    color: (color: string): CoverColor => ({
        type: 'color',
        color
    }),
    image: (image: string): CoverImage => ({
        type: 'image',
        image
    }),
};