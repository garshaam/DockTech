import { Room, Client } from "colyseus";
import { Entity } from "../../objects/entity";
import { User } from "../../objects/user";
import { State } from "./State";

interface MouseMessage {
  x: number;
  y: number;
}

export class StandardRoom extends Room<State> {
  state = new State();

  onCreate() {
    this.state.initialize();

    this.onMessage("mouse", (client, message: MouseMessage) => {

        const entity = this.state.entities.get(client.sessionId);

        if (entity && entity instanceof User) {
            //const dst = Entity.distance(entity, message as Entity); // This cast is ok
            // change angle
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

        this.state.createUser(client.sessionId, username);
    } catch (error) {
        console.log("Error adding client. Check if options object is defined properly.")
    }
    
  }

  onLeave(client: Client) {
    const entity = this.state.entities.get(client.sessionId);
    if (entity && entity instanceof User) {
        const username = entity.username;
        console.log(client.sessionId, "LEFT AS", username);
    }

    // entity may be already dead.
    if (entity) { entity.dead = true; }
  }

}
