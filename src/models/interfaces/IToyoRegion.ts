export interface IToyoRegion{
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    managedTypes?:string[];
}