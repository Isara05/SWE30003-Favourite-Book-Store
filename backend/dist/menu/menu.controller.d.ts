import { MenuService } from './menu.service';
export declare class MenuController {
    private readonly menu;
    constructor(menu: MenuService);
    getMenu(role?: string): {
        id: string;
        label: string;
    }[];
}
