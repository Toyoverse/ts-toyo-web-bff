import { Parts } from "./Part";

export interface Toyo{
    id: string;
    name: string;
    parts: Parts[];
    hasTenParts: boolean;
    isToyoSelected: boolean;
    createdAt: Date;
    updateAt: Date;

}