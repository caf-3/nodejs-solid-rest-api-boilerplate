import { PostgresBaseRepository } from "../../repositories/implementions/PostgreStudentSubscriptionRepository";
import { BaseJob } from "./baseFunc";

export default function handler() {
    const baseRepository = new PostgresBaseRepository();
    const job = new BaseJob(baseRepository);
    job.execute().then(console.log).catch(console.log);
}
