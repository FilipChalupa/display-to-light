import { colorRgbToHsl } from './colorRgbToHsl.js'

// Based on https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf
export const colorHexToHsl = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	if (result === null) {
		throw new Error(`${hex} is not hex color`)
	}
	let r = parseInt(result[1], 16)
	let g = parseInt(result[2], 16)
	let b = parseInt(result[3], 16)

	return colorRgbToHsl(r, g, b)
}
