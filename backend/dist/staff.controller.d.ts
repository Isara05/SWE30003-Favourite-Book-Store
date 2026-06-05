import { StaffService } from './staff/staff.service';
export declare class StaffController {
    private readonly staffService;
    constructor(staffService: StaffService);
    listStaff(): Promise<import("./domain").Staff[]>;
    getStaff(id: string): Promise<import("./domain").Staff>;
}
