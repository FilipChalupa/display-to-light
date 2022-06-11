import fetch from 'node-fetch'
import robot from 'robotjs'
import { colorHexToHsl } from './utils/colorHexToHsl.js'
import { delay } from './utils/delay.js'

console.log('Starting Display to Light')

const lights = [
	{
		mac: 'C2:BF:C7:30:AA:F3',
		pixel: {
			x: 640,
			y: 720,
		},
	},
	{
		mac: 'EC:C7:10:29:B1:22',
		pixel: {
			x: 1920,
			y: 720,
		},
	},
]

while (true) {
	console.log('Tick')
	await delay(50)

	for (const light of lights) {
		const forcedBrightness = 100
		const forcedSaturation = 100

		const hsl = colorHexToHsl(
			'#' + robot.getPixelColor(light.pixel.x, light.pixel.y),
		)

		console.log('Color', hsl)

		await fetch(
			`http://127.0.0.1:8080/NeewerLite-Python/doAction?nopage&light=${
				light.mac
			}&mode=HSI&hue=${Math.floor(
				hsl.h,
			)}&sat=${forcedSaturation}&brightness=${forcedBrightness}`,
		)
		await delay(500)
	}
}
