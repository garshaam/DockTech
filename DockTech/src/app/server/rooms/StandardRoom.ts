import { Room, Client } from "colyseus";
import { Schema, type, entity } from "@colyseus/schema";
import { Entity } from "../../objects/entity";
import { User } from "../../objects/user";
import { State } from "./State";

interface MouseMessage {
  x: number;
  y: number;
}

export class StandardRoom extends Room<State> {

  onCreate() {
    this.state = new State();
    this.state.initialize();

    // for (const [id, e] of this.state.entities) {
    //   const ok = !!(e as any)?.constructor?.[Symbol.metadata];
    //   console.log(id, "meta?", ok, "x=", e.x, "y=", e.y, "ctor=", (e as any).constructor?.name);
    // }

    //console.log("STATE meta?", !!(this.state as any).constructor?.[Symbol.metadata], "ctor=", (this.state as any).constructor?.name);


    this.onMessage("mouse", (client, message: MouseMessage) => { 

        const entity = this.state.entities.get(client.sessionId) as User;

        // Only users can send mouse messages
        // Should server-side check issues
        
        if (entity) {
            //const dst = Entity.distance(entity, message as Entity); // This cast is ok
            // change angle
            console.log("Mouse message...");
            entity.angle = Math.atan2(entity.y - message.y, entity.x - message.x);  
        }

        // // skip dead players
        // if (!entity) {
        //     console.log("DEAD PLAYER ACTING...");
        //     return;
        // }

      
    });

    //this.patchRate = 50; Server-client messaging

    //this.maxClients = 20;

    this.setSimulationInterval(() => this.state.update()); // Server gameloop
  }

  // Must ensure that client sends correct options object
  onJoin(client: Client, options: any) {
    try {
        const username = options.username;
        console.log(client.sessionId, "JOINED AS", username);

        for (const [id, e] of this.state.entities) {
          const ctor = (e as any)?.constructor;
          const meta = ctor?.[Symbol.metadata]; // yes, this is the same symbol in the error
          if (!meta) {
            console.error("MISSING Symbol.metadata:", id, ctor?.name, e);
          }
        }

        // for (const [id, e] of this.state.entities) {
        //   if (!(e instanceof Schema)) {
        //     console.error("NON-SCHEMA ENTITY:", id, e.toJSON());
        //   }
        //   else {
        //     console.error("YES-SCHEMA ENTITY:", id, e.toJSON());
        //   }
        // }

        //console.log("heyy");

        this.state.createUser(client.sessionId, username);

        //console.log("STATE JSON:", this.state.toJSON());
    } catch (error) {
        console.log("Error adding client. Check if options object is defined properly.")
        console.log(error);
    }
    
  }

  onLeave(client: Client) {
    const entity = this.state.entities.get(client.sessionId);
    if (entity && entity.kind === "user") {
        const username = (entity as User).username;
        console.log(client.sessionId, "LEFT AS", username);
    }

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
