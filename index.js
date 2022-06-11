import fetch from 'node-fetch'

console.log('Starting Display to Light')

const lights = [
	{
		mac: 'C2:BF:C7:30:AA:F3',
		pixel: {
			x: 100,
			y: 100,
		},
	},
	{
		mac: 'EC:C7:10:29:B1:22',
		pixel: {
			x: 50,
			y: 200,
		},
	},
]

const delay = async (milliseconds) =>
	new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, milliseconds)
	})

while (true) {
	console.log('Tick')
	await delay(50)

	for (const light of lights) {
		const brightness = 100 // 0 to 100
		const saturation = 100 // 0 to 100

		await fetch(
			`http://127.0.0.1:8080/NeewerLite-Python/doAction?nopage&light=${
				light.mac
			}&mode=HSI&hue=${Math.floor(
				Math.random() * 360,
			)}&sat=${saturation}&brightness=${brightness}`,
		)
		await delay(50)
	}
}
