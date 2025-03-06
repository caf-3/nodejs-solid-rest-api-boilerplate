import { Base as IBaseEntity } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";



export class BaseEntity {
    public readonly id!: string;
    public name!: string | null;
    public email!: string;
    public created_at!: Date;
    public updated_at!: Date;
    constructor(props: Omit<IBaseEntity, "id" | "created_at" | "updated_at">, id?: string) {
        Object.assign(this, props);
        if (!id) {
            this.id = uuidV4();
        }
    }
}
