import { Schema, type, entity } from "@colyseus/schema";

@entity
export class Entity extends Schema {
    @type("float64") x!: number;
    @type("float64") y!: number;
}