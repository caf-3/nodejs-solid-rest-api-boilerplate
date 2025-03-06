import { IBaseRepository } from "../../repositories/IBaseRepository";

export class BaseJob {
    constructor(private BaseRepository: IBaseRepository) {}
    async execute() {
        try {
            console.log("🚨🚨🚨 Running JOB 🚨🚨🚨");
            // set all subscriptions that are true and the expiration date have passed
            await this.BaseRepository.getBaseActionById("1");
            return "JOB 👌";
        } catch (error) {
            console.log({ error });
            return "JOB 👎";
        }
    }
}
