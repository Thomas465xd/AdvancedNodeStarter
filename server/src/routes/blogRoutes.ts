import requireLogin from "../middlewares/requireLogin.js";
import { Request, Response, Router } from "express";
import Blog from "../models/Blog.js";
import { getRedisClient } from "../config/redis.js";

const router = Router(); 

router.get("/api/blogs/:id", requireLogin, async (req: Request, res: Response) => {
    const blog = await Blog.findOne({
        _user: req.user!.id,
        _id: req.params.id,
    });

    res.send(blog);
});

router.get("/api/blogs", requireLogin, async (req: Request, res: Response) => {
    const blogs = await Blog.find({ _user: req.user!.id });
    
    res.status(200).json(blogs);
});

router.post("/api/blogs", requireLogin, async (req: Request, res: Response) => {
    const { title, content } = req.body;

    const blog = new Blog({
        title,
        content,
        _user: req.user!.id,
    });

    try {
        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ message: "Error saving Blog Post", err})
    }
});

export default router; 