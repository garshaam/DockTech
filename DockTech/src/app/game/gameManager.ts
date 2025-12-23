import {User} from "./user";

export class GameManager {
    public init(): void {

    }

    public destroy(): void {

    }

    public users: User[] = [];

    public addUser(user: User): string {

        return user.username;
    }
}
