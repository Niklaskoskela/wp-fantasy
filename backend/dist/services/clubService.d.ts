import { Club } from 'shared';
export declare class ClubService {
    static invalidateClubCaches(): void;
    static createClub(name: string): Promise<Club>;
    static getAllClubs(): Promise<Club[]>;
    static getClubById(id: string): Promise<Club | null>;
}
