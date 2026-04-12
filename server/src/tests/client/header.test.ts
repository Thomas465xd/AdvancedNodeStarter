it("The header has the correct text", async () => {
    // Wait for React to render
    await page.waitForSelector("a.brand-logo");

    // $eval runs JS document.querySelector within the context. If there's no element matching selector, 
    // the method throws an error.
    const text = await page.$eval("a.brand-logo", el => el.innerHTML); 

    expect(text).toEqual("Blogster");
})

it("Starts Google OAuth flow upon clicking on Login with Google Button", async () => {
    // Must start listening for navigation BEFORE triggering the click.
    // In headless mode, navigation can complete before waitForNavigation()
    // is called, causing it to hang waiting for a second navigation that never comes.
    await Promise.all([
        page.waitForNavigation({ timeout: 60000 }),
        page.click(".right a")
    ]);

    const url =  page.url();

    expect(url).toMatch(/accounts\.google\.com/) 
}, 60000)

it("Shows logout button when logged in", async () => {
    //? .login() is not native to page, it is defined in helpers/page.ts
    await page.login(); 

    //? .querySelector is not native to page, it is defined in helpers/page.ts
    const text = await page.querySelector("a[href='/auth/logout']"); 

    expect(text).toEqual("Logout"); 
}) 

// TODO: Test logout flow