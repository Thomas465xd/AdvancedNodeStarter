import mongoose from "mongoose";
import { getKeys } from "../../config/keys";
import { Buffer } from "node:buffer";
import Keygrip from "keygrip";
import { UserInterface } from "../../models/User";

//* Declare setCookie global helper function
export const createCookie = async (user: UserInterface) => {
    const keys = await getKeys(); 

    // Passport + cookie-session stores the authenticated user as:
    //   { passport: { user: <serialized user id> } }
    // This is what passport.serializeUser() produces when a real login happens.
    const sessionObject = {
        passport: {
            user: user._id.toString() //! Convert ObjectId to string 
        }
    };

    // cookie-session stores the session as a base64-encoded JSON string
    // in a cookie named "session". We replicate that encoding here.
    const session = Buffer.from(
        JSON.stringify(sessionObject)
    ).toString("base64"); 

    // cookie-session uses Keygrip to sign cookies for tamper protection.
    // It creates a second cookie "session.sig" containing an HMAC signature
    // of the session cookie value, using the app's cookieKey as the secret.
    // We use the same key here so the server trusts our forged cookie.
    const keygrip = new Keygrip([keys.cookieKey]);

    // Keygrip expects the format "session=<value>" to generate the signature,
    // matching how the cookie header is structured in real requests.
    const signature = keygrip.sign("session=" + session); 

    return { session, signature  }; 
};