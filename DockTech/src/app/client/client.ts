import { Client, Room, getStateCallbacks } from "colyseus.js";
import { State } from "../server/rooms/State";

let _endpoint: string | null = null;
let _client: Client | null = null;
let _room: Room<State> | null = null;

let defaultRoomType = "standard_room";
let defaultEndpoint = "http://localhost:2567";

/** Helper function to get client to server */
function getClient(endpoint: string): Client {
  if (!_client || _endpoint !== endpoint) {
    _endpoint = endpoint;
    _client = new Client(endpoint);
  }
  return _client;
}

export function currentRoom(): Room<State> | null {
  //console.log(_room);
  return _room;
}

export async function joinOrCreateRoom(
  username: string,
  roomType: string = defaultRoomType,
  endpoint: string = defaultEndpoint,
  options?: Record<string, unknown>
): Promise<{ room: Room<State>; roomId: string }> {
  const client = getClient(endpoint);

  if (_room) {
    await safeLeave(_room);
    _room = null;
  }

  const room = await client.joinOrCreate<State>(roomType, { username, ...options });
  _room = room;

  wireRoom(room);

  //console.log(room);

  return { room, roomId: room.roomId };
}

/** Host creates a room and gets a roomId to share */
export async function createRoom(
  endpoint: string,
  username: string,
  roomType: string = "standard_room"
): Promise<{ room: Room<State>; roomId: string }> {
  const client = getClient(endpoint);

  if (_room) {
    await safeLeave(_room);
    _room = null;
  }

  const room = await client.create<State>(roomType, { username });
  _room = room;

  wireRoom(room);
  return { room, roomId: room.roomId };
}

/** Guest joins an existing room by roomId */
export async function joinRoomById(
  endpoint: string,
  roomId: string,
  username: string
): Promise<Room<State>> {
  const client = getClient(endpoint);

  if (_room) {
    await safeLeave(_room);
    _room = null;
  }

  const room = await client.joinById<State>(roomId, { username });
  _room = room;

  wireRoom(room);
  return room;
}

/** Leave the current room */
export async function leaveRoom(consented: boolean = true): Promise<void> {
  if (!_room) return;
  const room = _room;
  _room = null;
  await safeLeave(room, consented);
}

/** Access schema callbacks for the active room */
export function roomStateCallbacks() {
  if (!_room) throw new Error("Not in a room.");
  return getStateCallbacks(_room);
}

/** Send a message to the room */
export function sendToRoom<T = unknown>(type: string, payload?: T): void {
  if (!_room) throw new Error("Not in a room.");
  _room.send(type as any, payload as any);
}

function wireRoom(room: Room<State>) {
  room.onLeave((code) => {
    if (_room === room) _room = null;
    console.log("Left room. code =", code);
  });

  room.onError((code, message) => {
    console.error("Room error:", code, message);
  });
}

async function safeLeave(room: Room, consented: boolean = true): Promise<void> {
  try {
    await room.leave(consented);
  } catch {
    // ignore if already disconnected
  }
}