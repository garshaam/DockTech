import { Container, Graphics } from "pixi.js";
import { Entity } from "../objects/entity";
import { User } from "../objects/user";

// Snapshot coming from state/network updates
//export type EntitySnapshot = { sessionId: string; x: number; y: number };

// What is actually displayed to the screen
type EntityRender = {g: Graphics; targetX: number; targetY: number; };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class WorldView {
  public readonly container = new Container();

  // sessionId -> render data (sprite + targets)
  private entityRenders = new Map<string, EntityRender>();

  private _interpolation = false;
  private _raf: number | null = null;

  /** Higher = snappier, lower = smoother. Typical: 0.1–0.3 */
  public lerpFactor = 0.2;

  /** Pixels close enough to snap (avoids endless tiny lerps) */
  public snapEpsilon = 0.02;

  addEntity(entity: Entity, sessionId: string) {
    //console.log(entity.kind);
    if (entity.kind === "entity") {
      const g = new Graphics().circle(0, 0, 100).fill(0xff0f0f);
      g.x = entity.x;
      g.y = entity.y;

      this.entityRenders.set(sessionId, { g, targetX: entity.x, targetY: entity.y });
      this.container.addChild(g);

      this.startInterpolation();
    }
    if (entity.kind === "user") {
      const g = new Graphics().circle(0, 0, 100).fill(0xf00f0f);
      g.x = entity.x;
      g.y = entity.y;

      this.entityRenders.set(sessionId, { g, targetX: entity.x, targetY: entity.y });
      this.container.addChild(g);

      this.startInterpolation();
    }
    
  }

  /** Call this whenever you receive a new position from the server */
  updateEntity(entity: Entity, sessionId: string) {
    const r = this.entityRenders.get(sessionId);
    if (!r) return;

    r.targetX = entity.x;
    r.targetY = entity.y;

    this.startInterpolation();
  }

  removeEntity(sessionId: string) {
    const r = this.entityRenders.get(sessionId);
    if (!r) return;

    r.g.destroy();
    this.entityRenders.delete(sessionId);

    if (this.entityRenders.size === 0) this.stopInterpolation();
  }

  destroy() {
    this.stopInterpolation();
    this.container.destroy({ children: true });
    this.entityRenders.clear();
  }

  private startInterpolation() {
    if (this._interpolation) return;
    this._interpolation = true;
    this.loop();
  }

  private stopInterpolation() {
    this._interpolation = false;
    if (this._raf !== null) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }

  private loop = () => {
    let anyMoving = false;

    for (const { g, targetX, targetY } of this.entityRenders.values()) {
      const dx = targetX - g.x;
      const dy = targetY - g.y;

      if (Math.abs(dx) > this.snapEpsilon || Math.abs(dy) > this.snapEpsilon) {
        g.x = lerp(g.x, targetX, this.lerpFactor);
        g.y = lerp(g.y, targetY, this.lerpFactor);
        anyMoving = true;
      } else {
        // snap when close enough
        g.x = targetX;
        g.y = targetY;
      }
    }

    if (this._interpolation && anyMoving) {
      this._raf = requestAnimationFrame(this.loop);
    } else {
      // Nothing left to smooth; stop the RAF until we get new targets
      this.stopInterpolation();
    }
  };
}