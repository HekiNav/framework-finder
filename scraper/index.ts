import { firefox } from "playwright"

(async () => {
    const browser = await firefox.launch()
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    const page = await context.newPage()
    await page.goto("https://frame.work/products")

    console.log(await page.title())
    browser.close()
})()