import { Container, Graphics } from "pixi.js";

// Snapshot coming from state/network updates
export type PlayerSnapshot = { sessionId: string; x: number; y: number };

// What is actually displayed to the screen
type PlayerRender = {g: Graphics; targetX: number; targetY: number; };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class WorldView {
  public readonly container = new Container();

  // sessionId -> render data (sprite + targets)
  private players = new Map<string, PlayerRender>();

  private _interpolation = false;
  private _raf: number | null = null;

  /** Higher = snappier, lower = smoother. Typical: 0.1–0.3 */
  public lerpFactor = 0.2;

  /** Pixels close enough to snap (avoids endless tiny lerps) */
  public snapEpsilon = 0.02;

  addPlayer(p: PlayerSnapshot) {
    const g = new Graphics().circle(0, 0, 10).fill(0xffffff);
    g.x = p.x;
    g.y = p.y;

    this.players.set(p.sessionId, { g, targetX: p.x, targetY: p.y });
    this.container.addChild(g);

    this.startInterpolation();
  }

  /** Call this whenever you receive a new position from the server */
  updatePlayer(p: PlayerSnapshot) {
    const r = this.players.get(p.sessionId);
    if (!r) return;

    r.targetX = p.x;
    r.targetY = p.y;

    this.startInterpolation();
  }

  removePlayer(sessionId: string) {
    const r = this.players.get(sessionId);
    if (!r) return;

    r.g.destroy();
    this.players.delete(sessionId);

    if (this.players.size === 0) this.stopInterpolation();
  }

  destroy() {
    this.stopInterpolation();
    this.container.destroy({ children: true });
    this.players.clear();
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

    for (const { g, targetX, targetY } of this.players.values()) {
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