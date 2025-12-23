import { Schema, type, entity } from "@colyseus/schema";

@entity
export class Entity extends Schema {
    @type("float64") x!: number;
    @type("float64") y!: number;

    dead: boolean = false;

    /**
     * Returns the distance between 2 entities
     * @param a The first entity (with defined x and y properties).
     * @param b The second entity (with defined x and y properties).
     * @returns The cartesian distance between (x,y)_a and (x,y)_b.
     */
    static distance(a: Entity, b: Entity) {
        
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}