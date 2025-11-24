import './scss/main.scss'

import './style.css'

import * as _bootstrap from 'bootstrap'

const BASE_URL = import.meta.env.BASE_URL

const params: Record<string, number | boolean | null> = {
    budget: null,
    storage: null,
    memory: null,
    display: null
}
const names: Record<string, string> = {
    storage: "Storage",
    memory: "Memory",
    processor: "CPU",
    display: "Display"
}
// how much score different attributes get
// basemult is applied always, and under/overmult on top of that
const baseMultipliers = {
    budget: {
        baseMult: 0.125,
        underMult: 1,
        overMult: 0.5
    },
    storage: {
        baseMult: 8,
        underMult: 1,
        overMult: 0.5
    },
    memory: {
        baseMult: 0.5,
        underMult: 1,
        overMult: 0.5
    },
    // cpu benchmark scores
    processor: {
        baseMult: 0.005,
        underMult: 1,
        overMult: 1
    }
}

const storageSizes = [
    "None",
    "500GB",
    "1TB",
    "2TB",
    "4TB",
    "8TB"
]

const typeFunctions: Record<string, Function> = {
    budget: (n: number) => `${n}€`,
    storage: (n: number) => storageSizes[n],
    memory: (n: number) => n == 0 ? "None" : `${n}GB`,
    number: (n: number) => `${n}`
}
generateOptions().then(options => {
    window.scrollTo({
        top: 0
    })

    console.log(options)
    document.querySelectorAll(".opens-section").forEach(el => {
        el.addEventListener("click", () => openSection(el.getAttribute("data-section")!))
    });


    [...Array.from(document.querySelectorAll(".range-output")), ...Array.from(document.querySelectorAll(".radio-output"))].forEach((el) => {
        const typeFunc = typeFunctions[el.getAttribute("data-type") || "number"]
        const output = document.querySelector(`output[for=${el.id}]`)
        el.addEventListener("mousemove", () => {
            updateParam(false)
        })
        el.addEventListener("change", () => {
            updateParam()
        })
        el.addEventListener("click", () => {
            updateParam()
        })
        updateParam()

        function updateParam(fullUpdate = true) {
            if (output) output.innerHTML = typeFunc((el as HTMLInputElement).value)
            if (!fullUpdate) return
            const type = el.getAttribute("data-type")!
            switch (type) {
                case "display":
                    const values: Record<string, boolean | null> = {
                        "btn-radio-display-yes" : true,
                        "btn-radio-display-neutral" : null,
                        "btn-radio-display-no" : false
                    }
                    const button = document.querySelector("#btn-radio-display")?.querySelector("*:checked")!
                    params.display = values[button?.id]
                    console.log(values, button.id)
                    break;
                default:
                    params[type] = Number((el as HTMLInputElement).value)
                    break;
            }
            generateSuggestions(options)
        }
    })
})


interface Product {
    id: string,
    title: string,
    choices: Choice[]
}
interface Choice {
    id: string,
    title: string,
    options: Option[]
}
interface Option {
    name: string,
    price: number,
    value: number | boolean
}
interface ProductOption {
    id: string,
    title: string,
    price: number,
    choices: ProductChoices
}
interface ProductChoices {
    processor?: Option,
    display?: Option,
    memory?: Option,
    storage?: Option
}
async function generateOptions() {
    const
        parameters = [
            "processor",
            "display",
            "memory",
            "storage",
        ],
        response = await fetch(BASE_URL + "fw-data.json"),
        products = await response.json(),
        options = products.reduce((prev: Array<ProductOption>, curr: Product) => {
            if (!curr.id.includes("diy")) return prev
            const products = [{ ...curr, choices: {}, price: 0 }]
            curr.choices.forEach(c => {
                if (!parameters.some(id => id == c.id)) return
                const pr = products.splice(0, products.length)
                c.options.forEach(o => {
                    pr.forEach(p => {
                        products.push({
                            ...p,
                            price: p.price + o.price,
                            choices: { ...p.choices, [c.id]: o }
                        })
                    })
                })
            })
            return [...prev, ...products]
        }, [])
    return options
}

function generateSuggestions(options: ProductOption[]) {
    const suggestions = options.map(o => ({ ...o, score: 0 }));
    [...Object.entries(params), ["processor", ""]].forEach(([id, value]) => {
        //console.log(id, value)
        if (value == null) return
        else suggestions.forEach(s => {
            const whitelist = ["budget"]
            s.score += Object.keys(s.choices).some(k => k == id) || whitelist.some(item => item == id) ? scoreFunction(id)(s, value) : 0
        })
    })
    const container = document.querySelector("#suggestion-container")!
    container.innerHTML = ""
    suggestions.sort((a, b) => b.score - a.score).slice(0,10).forEach(s => {
        container.innerHTML += `
        <div class="card" style="width: 15rem;">
          <img src="/fw-images/fw12.jpg" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">${s.title}</h5>
            <h6 class="card-subtitle mb-2 text-body-secondary">${typeFunctions.budget(s.price)} | ${Math.round(s.score)}pts</h6>
            <p class="card-text">
              ${Object.entries(s.choices).reduce((prev, [id, {name}]) => prev+`
                ${names[id]}: ${name}<br>
                `
            ,"")}
            </p>
          </div>
        </div>`
    });
}

function scoreFunction(paramId: string): Function {
    switch (paramId) {
        case "display":
            console.log("h")
            return (prod: ProductOption, param: boolean) => prod.choices.display?.value == param ? 20 : 0
        case "memory":
        case "storage":
            return (prod: ProductOption, param: number) => {
                const
                    diff = Number(prod.choices[paramId]?.value) - param,
                    { underMult, overMult, baseMult } = baseMultipliers[paramId]
                return diff * baseMult * (diff < 0 ? underMult : overMult)
            }
        case "processor":
            return (prod: ProductOption) => {
                const
                    diff = Number(prod.choices[paramId]?.value),
                    { baseMult } = baseMultipliers[paramId]
                return diff * baseMult
            }
        case "budget":
            return (prod: ProductOption, param: number) => (param - Number(prod.price)) * baseMultipliers.budget.baseMult * (param - Number(prod.price) < 0 ? baseMultipliers.budget.underMult : baseMultipliers.budget.overMult)
        default:
            return () => 0
    }
}

function openSection(sectionId: string) {
    const sectionSelector = `#collapse-${sectionId}`
    const otherSectionsSelector = `.accordion-collapse:not(#collapse-${sectionId})`

    const openedSection = document.querySelector(sectionSelector)!

    openedSection.classList.add("show")

    scrollIntoView(openedSection)

    document.querySelectorAll(otherSectionsSelector).forEach(el => el.classList.remove("show"))
}
function scrollIntoView(element: Element) {
    var innerHeightHalf = (window.innerHeight >> 1);

    var elementRect = element.getBoundingClientRect();

    window.scrollBy((elementRect.left >> 1), elementRect.top - innerHeightHalf);
}

