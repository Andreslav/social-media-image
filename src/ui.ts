import 'simplebar/dist/simplebar.min.css'; 
import './ui.scss';
import { dispatch, handleEvent } from './handlers/uiMessageHandler';
import SimpleBar from '../node_modules/simplebar/dist/simplebar.min.js';
import './figma-plugin-ds-master/js/disclosure.js';
import sizes from './config-size';


new SimpleBar(document.getElementById("app"), { autoHide: false })


// List

document.querySelector('.disclosure').append(
	... sizes.map((item, i) => {
		return createList(item)
	})
)

window["disclosure"].init();



// Settings

let isCreateGuides = document.getElementById("is-create-guides") as HTMLInputElement
let isCreateShapes = document.getElementById("is-create-shapes") as HTMLInputElement
let isLockHelperShapes = document.getElementById("is-lock-helper-shapes") as HTMLInputElement
let addRelaunchBtn = document.getElementById("add-relaunch-btn") as HTMLInputElement
handleEvent("set-settings", (data: Settings) => {
    isCreateGuides.checked = data.isCreateGuides
    isCreateShapes.checked = data.isCreateShapes
});
isCreateGuides.addEventListener("change", function(e) {
    dispatch('save-settings', {isCreateGuides: this.checked})
})
isCreateShapes.addEventListener("change", function(e) {
    dispatch('save-settings', {isCreateShapes: this.checked})
})
isLockHelperShapes.addEventListener("change", function(e) {
    dispatch('save-settings', {isLockHelperShapes: this.checked})
})
addRelaunchBtn.addEventListener("click", function(e) {
    dispatch("add-relaunch-btn")
})



// Menu

class Menu {
    selectTab = null;
    classToSelectedTab = null;
    tab = null;
    page = null;
    
    constructor(startTab, classToSelectedTab) {
        this.selectTab = startTab
        this.classToSelectedTab = classToSelectedTab
        this.tab = document.querySelectorAll("[data-page-name]")
        this.page = document.querySelectorAll("[data-page]")
        this.init()
    }

    init() {
        this.update()
        this.tab.forEach(e => {
            e.addEventListener("click", (e) => this.select(e))
        })
    }

    select(e) {
        this.selectTab = e.target.dataset.pageName
        this.update()
    }

    update() {
        this.tab.forEach(e => {
            let page = document.querySelector(`[data-page="${e.dataset.pageName}"]`)

            if (e.dataset.pageName == this.selectTab) {
                e.classList.add(this.classToSelectedTab)
                page.classList.remove("hidden")
            } else {
                e.classList.remove(this.classToSelectedTab)
                page.classList.add("hidden")
            }
        })
    }
}

new Menu("size", "header__menu-item--select")




function createList(list) {
	return <HTMLElement> createElem("li.disclosure__item",
		createElem("div.disclosure__label.disclosure--section", list.name),
		list.sizes.map((item, i) => {
			if (item.type === "list") {
				// return createList(item)
			} else if (item.type === "label") {
				return createElem("div.disclosure__content.section", createElem("div.label", item.name))
			} else {
				return createElem("div.disclosure__content", {
						html: `<span>${item.name}</span><span class="disclosure__content__size">${item.width} x ${item.height}</span>`,
						events: {
						    click: (e) => {
                                dispatch('create-frame', Object.assign({}, item, {list: list.name}))
							}
						}
					}
				)
			}
		})
	)
}



// Создаёт элемент
// numOfElements?:number, tag:string, options:{}, children...
function createElem(...args) {

    let elemCount = 1 

    if(Number.isInteger(args[0])){
        if(args[0]>0){
            elemCount = args[0]
            args.shift()
        } else throw new Error(`Element count must be larger than 0. Actual value: ${args[0]}`)
    } else if(Number(args[0])===args[0] && args[0]%1 !==0)  throw new Error("Floats are not supported for element count.")

    const tag = args[0] ? args[0] : "div" 
    args.shift()

    if(typeof tag != "string")
        throw new Error("Tag name must be a string")

    const newElem = document.createElement(tag.replace(/(#.*)|(\..*)/g, ""))
    const id = tag.match(/#(?:(?![#\.]).)*/)
    const classes = tag.match(/\.(?:(?![#\.]).)*/g)

    if(id){
        newElem.id = id[0].substr(1, id[0].length)
    }
    if(classes){
        newElem.className = classes.map(c => c.substr(1,c.length)).join(" ")
    }

    if(args.length) {

        if(typeof args[0] == "string") {
            newElem.innerHTML = args[0]
            args.shift()

        } else if(Object(args[0])===args[0] && !(args[0] instanceof HTMLElement) && !Array.isArray(args[0])){
            
            for(const attribute in args[0]){

                switch(attribute){

                    case "class":
                        newElem.className = args[0].class
                        break

                    case "style":
                        const styles = args[0].style

                        if(styles!=null && styles!=undefined && styles.constructor === Object){

                            newElem.style.cssText = Object.keys(styles)
                                .map(k => {
                                     const key = k.replace(/[A-Z]/g, k2 => `-${k2.toLowerCase()}`)
                                     const value = typeof styles[k]=="number" ? `${styles[k]}px` : styles[k]
                                     return `${key}:${value}`
                                })
                                .join(";")
                        } else if(typeof styles == "string"){
                            newElem.style.cssText = styles
                        } else throw new Error("Style value must be either object or string.")
                        break

                    case "events":
                        Object.keys(args[0].events).forEach(event => {
                    		const fn = args[0].events[event]

                        	event.split(' ').forEach(e => {
	                            if(Array.isArray(fn)){
	                                fn.forEach(f => newElem.addEventListener(e, f))
	                            }else if(typeof fn=="function"){
	                                newElem.addEventListener(e, fn)
	                            }
                        	})
                        })
                        break

                    case "dataset":
                        Object.keys(args[0].dataset).forEach(dskey => {
                            
                            const dsvalue = args[0].dataset[dskey]

                            newElem.dataset[dskey] = dsvalue
                        })
                        break

                    case "html":
                        newElem.innerHTML = args[0].html

                    default:
                        newElem[attribute] = args[0][attribute]
                }
            }
            args.shift()
        }
    }


    const processItem = item => {

        switch(true){
            case item instanceof HTMLElement:
                newElem.appendChild(item)
                break
                
            case Array.isArray(item):
                item.forEach(processItem)
                break

            case !!item && item.constructor === Object:
                throw new Error("Multiple attributes objects not supported")   
                break

            default:
                if(item != null){
                    console.warn(`Unsupported parameter. Type: ${typeof item} Value:`, item)
                }
        }
    }

    args.forEach(processItem)
    return elemCount>1 ? [...new Array(elemCount)].map(e => newElem.cloneNode()) : newElem
}