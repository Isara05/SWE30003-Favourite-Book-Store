import { AccountRole, StaffRole } from '../enums';
import { CustomerEntity, StaffEntity } from './person.entity';
export declare class UserFactory {
    static createUser(roleType: AccountRole | StaffRole | string, payload: {
        userId: string;
        name: string;
        address: string;
        email: string;
        phoneNumber: string;
        accountBalance?: number;
        passwordHash?: string;
    }): CustomerEntity | StaffEntity;
}
