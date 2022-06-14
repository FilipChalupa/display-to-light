import { colorRgbToHsl } from './utils/colorRgbToHsl.js'
import { delay } from './utils/delay.js'

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
		bluetoothCharacteristic: null,
	},
	{
		mac: 'EC:C7:10:29:B1:22',
		pixel: {
			x: Math.round((canvasSize.width / 4) * 3),
			y: Math.round(canvasSize.height / 2),
		},
		element: document.querySelector('.light + .light'),
		bluetoothCharacteristic: null,
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

const sendColorCommand = async (bluetoothCharacteristic, hsl) => {
	const prefixByte = 0x78
	const tagByte = 0x86
	const hueAByte = hsl.h & 0xff
	const hueBByte = (hsl.h & 0xff00) >> 8
	const saturationByte = hsl.s
	const lightnessByte = hsl.l
	const byteCountByte = 0x04
	const payloadWithoutChecksum = new Uint8Array([
		prefixByte,
		tagByte,
		byteCountByte,
		hueAByte,
		hueBByte,
		saturationByte,
		lightnessByte,
	])
	const checksum = payloadWithoutChecksum.reduce((sum, byte) => sum + byte, 0)
	const payload = new Uint8Array(payloadWithoutChecksum.length + 1)
	payload.set(payloadWithoutChecksum, 0)
	payload.set(new Uint8Array([checksum]), payloadWithoutChecksum.length)
	await bluetoothCharacteristic.writeValue(payload)
}

const setTurnCommand = async (bluetoothCharacteristic, on) => {
	const onCommand = new Uint8Array([0x78, 0x81, 0x01, 0x01, 0xfb])
	const offCommand = new Uint8Array([0x78, 0x81, 0x01, 0x02, 0xfc])
	await bluetoothCharacteristic.writeValue(on ? onCommand : offCommand)
}

lights.forEach((light) => {
	light.element.querySelector('button').addEventListener('click', async () => {
		const serviceUuid = '69400001-b5a3-f393-e0a9-e50e24dcca99'
		const characteristicUuid = '69400002-b5a3-f393-e0a9-e50e24dcca99'
		const status = light.element.querySelector('.status')

		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [{ namePrefix: 'NEEWER' }, { services: [serviceUuid] }],
			})

			status.textContent = '🔃'
			const server = await device.gatt.connect()
			const service = await server.getPrimaryService(serviceUuid)
			const characteristic = await service.getCharacteristic(characteristicUuid)
			status.textContent = '🔗'

			// Signalise connection established
			await setTurnCommand(characteristic, true)
			await delay(30)
			// Green
			await sendColorCommand(characteristic, {
				h: 117,
				s: 100,
				l: 40,
			})
			await delay(1000)

			light.bluetoothCharacteristic = characteristic
		} catch (error) {
			console.error(error)
			alert('Connection failed.')
		}
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

		const { bluetoothCharacteristic: characteristic } = light
		if (characteristic) {
			try {
				await sendColorCommand(characteristic, {
					h: hsl.h,
					s: 100,
					l: hsl.l > 2 ? Math.ceil(hsl.l / 30) : 0,
				})
			} catch (error) {
				console.error(error)
			}
		}
		await delay(20)
	}
}
