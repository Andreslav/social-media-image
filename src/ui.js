import './figma-plugin-ds-master/figma-plugin-ds.min.js';
import './figma-plugin-ds-master/scss/figma-plugin-ds.scss';

import './ui.scss';

import $ from 'jquery';
import Size from './config-size.js';



const continer = $(".disclosure")
continer.append(
	Size.map((socia, i) => {
		const disclosure__item = $("<li class='disclosure__item'>")

		disclosure__item.append(`<div class='disclosure__label disclosure--section'>${socia.name}<div>`)
		disclosure__item.append(
			socia.sizes.map((size, i) => {
				return $("<div>", {
					class: "disclosure__content",
					html: `<span>${size.description}</span><span>${size.width} x ${size.height}</span>`,
					on: {
						click: (e) => {
							size.name = socia.name
							parent.postMessage({ pluginMessage: { type: 'create-frame', data: size } }, '*')
						}
					}
				})
			})
		)

		return disclosure__item
	})
)




//initialize javascript
disclosure.init();