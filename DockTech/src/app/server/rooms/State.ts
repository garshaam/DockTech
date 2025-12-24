import { generateId } from "colyseus";
import { Schema, type, MapSchema, entity } from "@colyseus/schema";

import { User } from "../../objects/user";
import { Entity } from "../../objects/entity";

const WORLD_SIZE = 200;

@entity
export class State extends Schema {

  width = WORLD_SIZE;
  height = WORLD_SIZE;

//   @type({ map: User })
//   users = new MapSchema<User>();

  @type({ map: Entity })
  entities = new MapSchema<Entity>();

  // Can change to entity component system later...

  initialize () {
    // create some food entities
    for (let i = 0; i < 20; i++) {
      this.createFood();
    }
  }

  createFood () {
    const food = new Entity().assign({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    });
    this.entities.set(generateId(), food);
  }

  createUser(sessionId: string, username: string) {
    this.entities.set(sessionId, new User().assign({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      username: username,
      speed: 10
    }));
  }

  update() {
    const deadEntities: string[] = [];
    this.entities.forEach((entity, sessionId) => {
        if (entity.dead) {
            deadEntities.push(sessionId);
            return;
        }

        // Food gets eaten
        //deadEntities.push(sessionId);

        // Moving all users
        for (const entity of this.entities.values()) {
            if (entity.kind === "user" && (entity as User).speed > 0) {
                entity.x -= Math.cos((entity as User).angle) * (entity as User).speed;
                entity.y -= Math.sin((entity as User).angle) * (entity as User).speed;

                if (entity.x < 0) entity.x = 0;
                if (entity.x > WORLD_SIZE) entity.x = WORLD_SIZE;
                if (entity.y < 0) entity.y = 0;
                if (entity.y > WORLD_SIZE) entity.y = WORLD_SIZE;
            }
        }
    });

    // delete all dead foods
    deadEntities.forEach(entityId => {
      this.entities.delete(entityId);
    });

  }
}
