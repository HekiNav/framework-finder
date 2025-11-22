import './scss/main.scss'

import './style.css'

import * as bootstrap from 'bootstrap'

document.querySelectorAll(".opens-section").forEach(el => {
    el.addEventListener("click", () => openSection(el.getAttribute("data-section")!))
})
document.querySelectorAll(".range-output").forEach((el) => el.addEventListener("mousemove", () => {
    document.querySelector(`output[for=${el.id}]`)!.innerHTML = (el as HTMLInputElement).value
}))



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

