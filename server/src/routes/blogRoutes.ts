import requireLogin from "../middlewares/requireLogin";
import { Request, Response, Router } from "express";
import Blog from "../models/Blog";
import clearCache from "../middlewares/clearCache";

const router = Router(); 

router.get("/api/blogs/:id", requireLogin, async (req: Request, res: Response) => {
    const blog = await Blog.findOne({
        _user: req.user!.id,
        _id: req.params.id,
    });

    res.send(blog);
});

router.get("/api/blogs", requireLogin, async (req: Request, res: Response) => {
    const blogs = await Blog.find({ _user: req.user!.id }).cache({ key: req.user!.id });
    
    res.status(200).json(blogs);
});

router.post("/api/blogs", requireLogin, clearCache, async (req: Request, res: Response) => {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({
        title,
        content,
        imageUrl, 
        _user: req.user!.id,
    });

    try {
        await blog.save();
        console.log("Request Handler")
        res.status(201).json(blog);
    } catch (err) {
        res.status(400).json({ message: "Error saving Blog Post", err})
    }
});

export default router; 