import { Router, Request, Response } from "express";
import { s3 } from "../config/aws";
import { randomUUID } from "crypto";
import requireLogin from "../middlewares/requireLogin";

const router = Router();

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

router.get("/api/images/upload", requireLogin,  (req: Request, res: Response) => {
    const contentType = req.query.contentType as string;

    if (!ALLOWED_TYPES.includes(contentType)) {
        return res.status(400).json({ error: "Invalid file type" });
    }

    const ext = contentType.split("/")[1];
    //? Uploaded image key/filename
    const key = `${req.user?.id}/${randomUUID()}.${ext}`;

    s3.getSignedUrl("putObject", {
        Bucket: "blogs-node-bucket-533267416121-us-east-1-an", 
        ContentType: contentType, 
        Expires: 60,
        Key: key
    }, (err, url) => res.status(200).json({ key, url }));
});

export default router;
