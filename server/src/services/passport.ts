import passport from "passport";
import pkg from "passport-google-oauth20";
const { Strategy: GoogleStrategy } = pkg;
import { getKeys } from "../config/keys.js";
import User from "../models/User.js";

passport.serializeUser((user: any, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then((user) => {
		done(null, user);
	});
});

const keys = await getKeys();

passport.use(
	new GoogleStrategy(
		{
			callbackURL: "/auth/google/callback",
			clientID: keys.googleClientID, 
			clientSecret: keys.googleClientSecret,
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const existingUser = await User.findOne({
					googleId: profile.id,
				});

				if (existingUser) {
					return done(null, existingUser);
				}
                
				const user = await (new User({
					googleId: profile.id,
					displayName: profile.displayName,
				}) as any).save();

				done(null, user);
			} catch (err) {
				done(err as Error);
			}
		},
	),
);
