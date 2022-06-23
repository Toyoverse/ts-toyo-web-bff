import { Box } from "./Box";
import { Parts } from "./Part";
import { Toyo } from "./Toyo";

export interface Player {
    id: string;
    wallet: string;
    token: string;
    expiresAt: Date;
    toyos: Toyo[];
    lastUnboxingFinishedAt: Date;
    hasPendingUnboxing: boolean;
    lastUnboxingStartedAt: Date;
    toyoParts: Parts[];
    boxes: Box[];
    createdAt: Date;
    updateAt: Date;


    getExpiresAtFormatted(expiresAt: Date): string;
}