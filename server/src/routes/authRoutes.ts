import { Router, Request, Response } from "express";
import passport from "passport";

const router = Router();

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    }),
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req: Request, res: Response) => {
        // In production the apps would be in the same origin
        res.redirect(process.env.NODE_ENV === "production"  ? "/blogs" : "http://localhost:3000/blogs");
    },
);

router.get("/auth/logout", (req: Request, res: Response) => {
    req.logout(() => {
        res.redirect("/");
    });
});

router.get("/api/current_user", (req: Request, res: Response) => {
    res.send(req.user);
});

export default router;