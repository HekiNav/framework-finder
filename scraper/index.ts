import { BrowserContext, firefox, Locator, selectors } from "playwright";
import * as fs from "node:fs/promises"


const paths = [
    ///* FW 12 */
    //"laptop12-intel-13gen",
    //"laptop12-diy-intel-13gen",
    ///* FW 13 PREBUILT */
    //"laptop13-amd-ai300",
    //"laptop-13-gen-amd",
    //"laptop13-intel-ultra-1",
    //"laptop-13-gen-intel",
    ///* FW 13 DIY */
    "laptop13-diy-amd-ai300",
    "laptop-diy-13-gen-amd",
    "laptop13-diy-intel-ultra-1",
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

    // Function to get sections from a FW product page
    // Array.from(document.querySelectorAll(".product-configuration-section")).map(el => el.getAttribute("data-test-id"))

    const sectionIds = [
        "color",
        "processor",
        "display",
        "memory",
        "storage",
        "operating-system",
        "keyboard",
        "bezel",
        "power-adapter",
        "expansion-cards", 
        "expansion-bay-module", 
        "primary-storage", 
        "secondary-storage", 
        "input-modules"
    ]

    const sections = (await Promise.all(sectionIds.map(async id => ({ locator: page.getByTestId(id), isVisible: await page.getByTestId(id).isVisible() })))).flatMap(({ locator, isVisible }) => isVisible ? locator : [])
    return await Promise.all(sections.map(async (s: Locator) => {
        return {
            title: await s.locator("b").innerHTML(),
            options: await Promise.all((await s.locator(".accordion-section-content li").all()).map(async opt => ({
                name: await opt.getByTestId(/select\-hardware\-.*/).allTextContents(),
                price: await opt.locator('*[data-js-target="option-price"]').allTextContents()
            })))
        }
    }))

}