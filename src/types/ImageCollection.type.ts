import { Image } from "./Image.type";

export type ImageCollection = {
    id: number;
    name: string;
    images: Image[];
    canShuffle: boolean;
}