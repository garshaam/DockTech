import { Schema, type, entity } from "@colyseus/schema";
import { Entity } from "./entity";

@entity
export class User extends Entity {
    @type("string") _username!: string;
    @type("number") _speed!: number;
    
    angle: number = 0; // Where is zero angle?

    constructor() {
        super();
        //this.radius = DEFAULT_PLAYER_RADIUS;
    }

    public get username(): string {
        return this._username;
    }

    public get speed(): number {
        return this._speed;
    }
}