import { colorRgbToHsl } from '../utils/colorRgbToHsl.js'
import { delay } from '../utils/delay.js'

const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })

const video = document.querySelector('video')
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

video.srcObject = videoStream

const canvasSize = {
	width: canvas.clientWidth,
	height: canvas.clientHeight,
}

const lights = [
	{
		mac: 'C2:BF:C7:30:AA:F3',
		pixel: {
			x: Math.round(canvasSize.width / 4),
			y: Math.round(canvasSize.height / 2),
		},
		element: document.querySelector('.light'),
	},
	{
		mac: 'EC:C7:10:29:B1:22',
		pixel: {
			x: Math.round((canvasSize.width / 4) * 3),
			y: Math.round(canvasSize.height / 2),
		},
		element: document.querySelector('.light + .light'),
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

lights.forEach((light) => {
	light.element.querySelector('button').addEventListener('click', async () => {
		const serviceUuid = '69400001-b5a3-f393-e0a9-e50e24dcca99'
		const characteristicUuid = '69400002-b5a3-f393-e0a9-e50e24dcca99'
		const onCommand = new Uint8Array([0x78, 0x81, 0x01, 0x01, 0xfb])
		const offCommand = new Uint8Array([0x78, 0x81, 0x01, 0x02, 0xfc])

		const device = await navigator.bluetooth.requestDevice({
			filters: [{ namePrefix: 'NEEWER' }, { services: [serviceUuid] }],
		})
		console.log(device)
		const server = await device.gatt.connect()
		console.log(server)
		const service = await server.getPrimaryService(serviceUuid)
		console.log(service)
		const characteristic = await service.getCharacteristic(characteristicUuid)
		console.log(characteristic)

		await characteristic.writeValue(onCommand)
		await delay(100)
		await characteristic.writeValue(offCommand)
		await delay(100)
		await characteristic.writeValue(onCommand)
		// await delay(100)
		// await characteristic.writeValue(
		// 	new Uint8Array([0x78, 0x86, 4, 0xff, 0xff, 0xff, 0xff]),
		// )
		// await delay(100)
	})
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

		const color = light.element.querySelector('.color')

		color.style.setProperty('--base', `rgb(${r}, ${g}, ${b})`)
		color.style.setProperty('--hue', `hsl(${hsl.h}, 100%, ${hsl.l}%)`)

		// @TODO: send command to bluetooth light
		await delay(50)
	}
}
