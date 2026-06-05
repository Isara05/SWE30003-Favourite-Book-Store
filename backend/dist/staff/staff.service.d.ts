import { DatabaseProxyService } from '../database/database-proxy.service';
import { Staff } from '../domain/models';
export declare class StaffService {
    private readonly db;
    constructor(db: DatabaseProxyService);
    listStaff(): Promise<Staff[]>;
    getStaff(employeeId: string): Promise<Staff>;
}
