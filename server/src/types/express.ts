import { UserInterface } from "../models/User.js";

declare global {
    namespace Express {
        interface User extends UserInterface {}
    }
}

export {};
