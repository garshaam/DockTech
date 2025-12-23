import { Schema, type, entity } from "@colyseus/schema";
import { Entity } from "./entity";

@entity
export class Player extends Entity {
    @type("string") _username!: string;

    constructor() {
        super();
        //this.radius = DEFAULT_PLAYER_RADIUS;
    }

    public get username(): string {
        return this._username;
    }
}