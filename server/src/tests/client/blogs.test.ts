import { Action } from "../helpers/page";

describe("When logged in", () => {
    beforeEach(async () =>  {
        //? .login() is not native to page, it is defined in helpers/page.ts
        await page.login(); 
        await page.click("a.btn-floating"); 
    }, 60000)

    it("tests blog create form appearing", async () => {
        expect(page.url()).toBe("http://localhost:3000/blogs/new");

        const label = await page.querySelector("form label"); 
        
        expect(label).toEqual("Blog Title"); 
    })

    describe('Tests for invalid form inputs', () => {
        beforeEach(async () =>  {
            await page.click("form button")
        })

        it("tests form error message appearing", async ()  => {
            const titleError  =  await page.querySelector(".title .red-text"); 
            const contentError = await page.querySelector(".content .red-text"); 

            expect(titleError).toEqual("You must provide a value"); 
            expect(contentError).toEqual("You must provide a value"); 
        })
    });
    
    describe('Tests for valid form inputs', () => {
        beforeEach(async () =>  {
            // Complete form inputs
            const title = "Test Blog Title"; 
            const content = "Test Blog Content"; 

            await page.type(".title input", title); 
            await page.type (".content input", content)

            // Click on Submit button
            await page.click("form button"); 
        })

        it("tests submitting takes user to review screen", async ()  => {
            const confirmationTitle = await page.querySelector("h5"); 

            expect(confirmationTitle).toEqual("Please confirm your entries")
        })

        it("Submitting then saving adds blog to index page", async ()  => {
            await page.click("button.green"); 
            await page.waitForSelector("div.card-content"); 

            const blogTitle = await page.querySelector("span.card-title"); 
            const blogContent = await page.querySelector("p"); 

            expect(blogTitle).toEqual("Test Blog Title");
            expect(blogContent).toEqual("Test Blog Content"); 
        })
    });
})

describe('When user is not logged in', () => {
    const actions : Action[] = [
        {
            method: "POST", 
            path: "/api/blogs", 
            body: { title: "My Title", content: "My Content" }
        }, 
        {
            method: "GET", 
            path: "/api/blogs", 
        }
    ]

    it("tests user cannot create blog posts", async ()  => {
        const body = { title: "My Title", content: "My Content" }; 
        const result = await page.post("/api/blogs", body)

        expect(result).toEqual({ error: "You must log in!" })
    })

    it("tests user cannot retrieve list of posts", async ()  => {
        const result = await page.get("/api/blogs")

        expect(result).toEqual({ error: "You must log in!" })
    })

    it("tests blog related actions are prohibited", async ()  => {
        const results = await page.execRequests(actions); 

        for (let result of results) {
            expect(result).toEqual({ error: "You must log in!" })
        }
    })
});