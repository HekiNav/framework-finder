import { firefox, Page } from "playwright"

const paths = [
    /* FW 12 */
    "laptop12-intel-13gen",
    "laptop12-diy-intel-13gen",
    /* FW 13 PREBUILT */
    "laptop13-amd-ai300",
    "laptop-13-gen-amd",
    "laptop13-intel-ultra-1",
    "laptop-13-gen-intel",
    /* FW 13 DIY */
    "laptop13-diy-amd-ai300",
    "laptop-diy-13-gen-amd",
    "laptop13-diy-intel-ultra-1",
];

(async () => {
    const browser = await firefox.launch()
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    });
    const page = await context.newPage()

    const scrapedData = await Promise.all(paths.map(productId => scrapeProduct(productId, page)))
    console.log(scrapedData)
    browser.close()
})()

async function scrapeProduct(id, page) {
    return new Promise(async (res) => {
        await page.goto(`https://frame.work/fi/en/products/${id}/`)
        page.once("load", async () => {
            res(await page.$eval("#product-configurations-accordion-component-processor", el => el.innerHTML))
        })
    })

}