import { Browser, Page } from "puppeteer";

// Intersection type lets consumers call both CustomPage and Page methods on the proxy
export type CustomPageProxy = CustomPage & Page;

export type Action = {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    path: string, 
    body?: any
}

class CustomPage {
    static async build(browser: Browser) {
        const page = await browser.newPage(); 
        const customPage = new CustomPage(page); 

        //? The Proxy intercepts every property access on customPage.
        // It checks customPage first, then delegates to the real Page object.
        // This lets us add custom helper methods (e.g. login()) while still
        // exposing all native Page methods (goto, click, $eval, etc.) seamlessly.
        return new Proxy(customPage, {
            get(target, property, receiver) {
                //? 1) If CustomPage has the property, use it directly.
                //    This gives our custom methods priority over Page methods.
                if (target[property as keyof typeof property]) {
                    return target[property as keyof typeof property];
                }

                //? 2) Otherwise, look up the property on the real Page instance.
                const value = page[property as keyof Page];

                //? 3) If it's a function, we must ensure `this` is the real Page
                //    object — not the Proxy. Modern Puppeteer uses private class
                //    fields (#frameManager, etc.) which are bound to the original
                //    instance. If `this` were the Proxy, accessing those private
                //    fields would throw "Cannot read private member".
                if (value instanceof Function) {
                    return function (this: any, ...args: any[]) {
                        // If called on the proxy (this === receiver), redirect
                        // `this` to the real page. Otherwise preserve the caller's
                        // context (e.g. when the method is passed as a callback).
                        return (value as Function).apply(
                            this === receiver ? page : this,
                            args
                        );
                    };
                }

                //? 4) Non-function properties (e.g. page.url) are returned as-is.
                return value;
            },
        }) as CustomPageProxy;
    }

    // Private constructor, instances are only created via CustomPage.build()
    private constructor(private readonly page: Page) {}

    async querySelector(selector: string) {
        /**
         * @param selector = CSS Selector '#id', '.class', 'div > p'
         */
        return this.page.$eval(selector, element => element.innerHTML)
    }

    //* Quickly log user into the app
    async login() {
        // The user must exist in the DB — when the app loads, it calls /api/current_user,
        // which triggers passport.deserializeUser → User.findById(id).
        // If no user is found, the session is treated as unauthenticated.
        const user = await global.createUser(); 

        // Pass user to createCookie factory
        const { session, signature } = await global.createCookie(user);

        //? Set cookies in the browser instance
        await browser.setCookie({ 
            name: "session", 
            value: session, 
            domain: "localhost", 
            path: "/"
        })

        await browser.setCookie({
            name: "session.sig",  
            value: signature, 
            domain: "localhost", 
            path: "/"
        })

        //? We first need to navigate into /blogs route to simulate redirect
        await this.page.goto("http://localhost:3000/blogs")

        // Wait for logout button to appear (increased timeout for slower environments)
        await this.page.waitForSelector("a[href='/auth/logout']", { timeout: 60000 });
    }

    /** get() and post() can be easily replaced by execRequests(), but kept for learning purposes */

    //* Quickly perform HTTP "GET" request from within the browser context.
    /**
     * @param path - Route to fetch from (e.g., "/api/blogs")
     * @returns - Parsed JSON response from server
     * 
     * @note We pass `path` as an argument to evaluate() rather than accessing
     * it via closure because page.evaluate() serializes function code to send
     * it to the browser — closure variables aren't serialized. Passing as an
     * argument ensures it's transmitted correctly to the browser context.
     * 
     * @example
     * const blogs = await page.get("/api/blogs");
     * expect(blogs).toEqual([...]);
     */
    async get(path: string) {
        return await this.page.evaluate(async (_path) => {
            return fetch(_path, {
                method: "GET", 
                credentials: "same-origin", 
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => res.json()); 
        }, path);
    }

    //* Quickly perform HTTP "POST" request from within the browser context.
    /**
     * @param path - Route to post to (e.g., "/api/blogs")
     * @param body - Request body object (automatically JSON stringified)
     * @returns - Parsed JSON response from server
     * 
     * @note We pass both `path` and `body` as arguments to evaluate() for the
     * same reason as get() — page.evaluate() serializes function code, so closure
     * variables won't be available in the browser context. Arguments are transmitted
     * correctly via the serialization protocol.
     * 
     * @example
     * const result = await page.post("/api/blogs", { title: "New Blog" });
     * expect(result.id).toBeDefined();
     */
    async post(path: string, body: any) {
        return await this.page.evaluate(async (_path, _body) => {
            return fetch(_path, {
                method: "POST", 
                credentials: "same-origin", 
                headers: {
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify(_body)
            }).then(res => res.json()); 
        }, path, body);
    }

    //* Quickly performs multiple HTTP requests from within the browser context.
    /**
     * Executes an array of Action objects in parallel, each describing an HTTP verb, path, and optional body.
     * Useful when you need to test multiple HTTP verbs (PUT, PATCH, DELETE) in a single operation.
     * 
     * @param actions - Array of Action objects, each containing:
     *   - method: HTTPVerbs enum (GET, POST, PUT, PATCH, DELETE)
     *   - path: Route to send request to (e.g., "/api/blogs/123")
     *   - body: Optional request body (automatically JSON stringified)
     * @returns - Promise resolving to an array of parsed JSON responses from the server
     * 
     * @note We pass method, path, and body as arguments to evaluate() because
     * page.evaluate() serializes function code to send it to the browser —
     * closure variables aren't serialized. Arguments are transmitted correctly
     * via the serialization protocol.
     * 
     * @example
     * const results = await page.execRequests([
     *   { method: HTTPVerbs.PUT, path: "/api/blogs/123", body: { title: "Updated" } },
     *   { method: HTTPVerbs.DELETE, path: "/api/blogs/456" }
     * ]);
     * expect(results[0].success).toBe(true);
     * expect(results[1].success).toBe(true);
     */
    async execRequests(actions: Action[]) : Promise<any[]> {
        return Promise.all(
            actions.map(action =>
                this.page.evaluate(async (_method, _path, _body) => {
                    return fetch(_path, {
                        method: _method.toString(), 
                        credentials: "same-origin", 
                        headers: {
                            "Content-Type": "application/json"
                        }, 
                        body: _body ? JSON.stringify(_body) : undefined
                    }).then(res => res.json()); 
                }, action.method, action.path, action.body)
            )
        );
    }
}

export default CustomPage