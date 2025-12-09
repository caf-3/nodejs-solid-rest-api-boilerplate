import { User as IUserEntity } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

export class UserEntity {
    public readonly id!: string;
    public email!: string;
    public name!: string | null;
    public password!: string;
    public profilePicture!: string;
    public googleId!: string;
    public created_at!: Date;
    public updated_at!: Date;

    constructor(props: Omit<IUserEntity, "id" | "created_at">, id?: string) {
        Object.assign(this, props);
        if (!id) {
            this.id = uuidV4();
        }
    }
}
