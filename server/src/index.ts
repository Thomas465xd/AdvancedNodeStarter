import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import passport from "passport";
import cookieSession from "cookie-session";
import express, { Request, Response } from "express";
import { getKeys } from "./config/keys";
import morgan from "morgan";
import "./types/express";
import "./services/passport";
import "./services/cache"; 
import colors from "colors";
import authRoutes from "./routes/authRoutes";
import blogRoutes from "./routes/blogRoutes";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
}

// In production requrie env variables to be set 
if (process.env.NODE_ENV === "production") {
    if(!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined");
    }

    if(!process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error("GOOGLE_CLIENT_SECRET is not defined");
    }

    if(!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not defined");
    }

    if(!process.env.REDIS_PASSWORD) {
        throw new Error("REDIS_PASSWORD is not defined");
    }
}

async function bootstrap() {
    try {
        const keys = await getKeys();

        await connectDB(); 
        await connectRedis(); 

        const app = express();

        app.use(bodyParser.json());

        app.use(
            cookieSession({
                maxAge: 30 * 24 * 60 * 60 * 1000,
                keys: [keys.cookieKey],
            }),
        );

        app.use(passport.initialize());

        app.use(passport.session());

        app.use(morgan("dev"));

        app.use(authRoutes);
        app.use(blogRoutes); 

        if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "ci") {
            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const clientBuild = path.resolve(__dirname, "..", "..", "client", "build");
            app.use(express.static(clientBuild));

            app.get("*", (req: Request, res: Response) => {
                res.sendFile(path.join(clientBuild, "index.html"));
            });
        }

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(colors.green(`Listening on Port ${colors.bold(`${PORT}`)}`));
        });
    } catch (error) {
        console.error("Failed to bootstrap application:", error);
        process.exit(1);
    }
}

bootstrap();
