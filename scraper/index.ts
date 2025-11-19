import { BrowserContext, firefox, selectors } from "playwright";
import * as fs from "node:fs/promises"

const paths = [
    /* FW 12 */
    "laptop12-intel-13gen",
    //"laptop12-diy-intel-13gen",
    ///* FW 13 PREBUILT */
    //"laptop13-amd-ai300",
    //"laptop-13-gen-amd",
    //"laptop13-intel-ultra-1",
    //"laptop-13-gen-intel",
    ///* FW 13 DIY */
    //"laptop13-diy-amd-ai300",
    //"laptop-diy-13-gen-amd",
    //"laptop13-diy-intel-ultra-1",
];

(async () => {
    console.log("Initting Firefox")

    selectors.setTestIdAttribute("data-test-id")

    const browser = await firefox.launch()
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'
    });
    console.log("Initted Firefox")
    const scrapedData = await Promise.all(paths.map(productId => scrapeProduct(productId, context)))

    await fs.writeFile("scraped-data.json", JSON.stringify(scrapedData))
    browser.close()
})()

async function scrapeProduct(id: string, context: BrowserContext) {
    console.log("scraping " + id)

    const page = await context.newPage()

    await page.goto(`https://frame.work/fi/en/products/${id}/`)

    console.log("loaded " + id)

    const sections = await page.getByTestId("product-configurations-accordion-component-trigger").all()

    return sections.map(s => ({
        title: s.getByTestId("option-type-6").locator("b").allTextContents()
    }))

}