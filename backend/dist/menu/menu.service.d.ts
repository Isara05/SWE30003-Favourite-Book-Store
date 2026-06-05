import { AccountRole } from '../domain/enums';
export declare class MenuService {
    getMenuForRole(role: AccountRole | string): {
        id: string;
        label: string;
    }[];
}
