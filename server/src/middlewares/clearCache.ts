import { NextFunction, Request, Response } from "express";
import { clearHash } from "../services/cache.js";

const clearCache = async (req: Request, res: Response, next: NextFunction) => {
    // finish event fires up once request handler completes execution.
    res.on("finish", () => {
        //? Kill hash key associated with current user blog posts
        // This allows for a new request to DB once user is redirected after 
        // new blog post creation instead of serving the now outdated cache data.
        clearHash(req.user!.id);
    });

    next();
};

export default clearCache;
