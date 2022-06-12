import { colorRgbToHsl } from '../utils/colorRgbToHsl.js'
import { delay } from '../utils/delay.js'

const neewerServerIp = '192.168.0.143'

const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })

const video = document.querySelector('video')
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

video.srcObject = videoStream

const canvasSize = {
	width: 100,
	height: 50,
}

const lights = [
	{
		mac: 'C2:BF:C7:30:AA:F3',
		pixel: {
			x: Math.round(canvasSize.width / 4),
			y: Math.round(canvasSize.height / 2),
		},
		element: document.querySelector('#color-1'),
	},
	{
		mac: 'EC:C7:10:29:B1:22',
		pixel: {
			x: Math.round((canvasSize.width / 4) * 3),
			y: Math.round(canvasSize.height / 2),
		},
		element: document.querySelector('#color-2'),
	},
]

canvas.width = canvasSize.width
canvas.height = canvasSize.height

document.addEventListener('keyup', (event) => {
	if (event.key === 'Escape') {
		alert('Reload')
		window.location.reload()
	}
})

while (true) {
	for (const light of lights) {
		context.drawImage(video, 0, 0, canvasSize.width, canvasSize.height)
		const [r, g, b] = context.getImageData(
			light.pixel.x,
			light.pixel.y,
			1,
			1,
		).data
		const hsl = colorRgbToHsl(r, g, b)

		light.element.style.setProperty('--base', `rgb(${r}, ${g}, ${b})`)
		light.element.style.setProperty('--hue', `hsl(${hsl.h}, 100%, ${hsl.l}%)`)

		try {
			await fetch(
				`http://${neewerServerIp}:8080/NeewerLite-Python/doAction?nopage&light=${
					light.mac
				}&mode=HSI&hue=${Math.floor(hsl.h)}&sat=${100}&brightness=${
					hsl.l > 2 ? Math.ceil(hsl.l / 30) : 0
				}`,
			)
		} catch (error) {
			console.error(error)
			await delay(250)
		}
		await delay(50)
	}
}
