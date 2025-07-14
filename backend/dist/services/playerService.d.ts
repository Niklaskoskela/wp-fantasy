import { PlayerPosition } from 'shared';
export declare class PlayerService {
    static invalidatePlayerCaches(): void;
    static createPlayer(name: string, position: PlayerPosition, clubId: string): Promise<{
        id: any;
        name: any;
        position: any;
        club: {
            id: any;
            name: any;
        };
        statsHistory: Map<any, any>;
    }>;
    static getAllPlayers(): Promise<{
        id: any;
        name: any;
        position: any;
        club: {
            id: any;
            name: any;
        };
        statsHistory: Map<any, any>;
    }[]>;
    static getPlayerById(id: string): Promise<{
        id: any;
        name: any;
        position: any;
        club: {
            id: any;
            name: any;
        };
        statsHistory: Map<any, any>;
    } | null>;
}
