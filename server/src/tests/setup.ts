import { jest } from "@jest/globals";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

import mongoose from "mongoose";
import puppeteer, { Browser } from "puppeteer";
import { createCookie, createUser } from "./factories/index.js"
import { UserInterface } from "../models/User.js";
import { getKeys } from "../config/keys.js";
import CustomPage, { CustomPageProxy } from "./helpers/page.js"; 

//? Define and type global testing variables and functions
// Make page and browser variables globally accessible 
declare global {
    var createCookie: (user: UserInterface) => Promise<{ session: string; signature: string; }>;
    var createUser: (googleId?: string, displayName?: string) => Promise<UserInterface>;
	var page: CustomPageProxy;
	var browser: Browser;
}

beforeAll(async () => {
    // Connect to the SAME database the running server uses,
    // so that users created here are visible to the server's deserializeUser.
    const keys = await getKeys();
    await mongoose.connect(keys.mongoURI);
});

beforeEach(async () => {
	jest.clearAllMocks(); // Resets mock implementations in between tests so that they are not polluted

	if (mongoose.connection.db) {
		const collections = await mongoose.connection.db.collections();

		for (let collection of collections) {
			await collection.deleteMany({});
		}
	}

    //? Chromium instance setup
    global.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    global.page = await CustomPage.build(global.browser); 

    // Navigate to app route
    await global.page.goto("http://localhost:3000");
    
}, 30000);

afterEach(async () =>  {
    //? Close chromium instance after each test
    if (global.browser) {
        await global.browser.close();
    }
})

afterAll(async () => {
    // Temporarily silence EVERYTHING | This is for some annoying unknown warning console log
    const noop = () => {};
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = noop;
    console.error = noop;

    try {
        //? Close chromium instance after test suite
        if (global.browser) {
            await global.browser.close();
        }

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    } finally {
        // Restore console
        console.warn = originalWarn;
        console.error = originalError;
    }
});

//* Assign imported factory helper functions
global.createUser = createUser;
global.createCookie = createCookie;