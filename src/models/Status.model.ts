import { Status } from "./interfaces/Status";

export default class StatusModel implements Status{
    vitality?: number;
    resistance?: number;
    resilence?: number;
    physicalStrength?: number;
    cyberForce?: number;
    technique?: number;
    analysis?: number;
    agility?: number;
    speed?: number;
    precision?: number;
    stamina?: number;
    luck?: number;

    constructor(){}
}