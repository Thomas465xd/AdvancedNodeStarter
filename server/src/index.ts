import path from "path";
import bodyParser from "body-parser";
import passport from "passport";
import cookieSession from "cookie-session";
import express, { Request, Response } from "express";
import { getKeys } from "./config/keys.js";
import morgan from "morgan";
import "./types/express.js";
import "./services/passport.js";
import "./services/cache.js"; 
import colors from "colors";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";

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

const keys = await getKeys();

connectDB(); 
connectRedis(); 

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
	app.use(express.static("client/build"));

	app.get("*", (req: Request, res: Response) => {
		res.sendFile(path.resolve("client", "build", "index.html"));
	});
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(colors.green(`Listening on Port ${colors.bold(`${PORT}`)}`));
});
