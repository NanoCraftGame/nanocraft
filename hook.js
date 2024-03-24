import http from 'http'

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		let body = ''

		req.on('data', (chunk) => {
			body += chunk
		})

		req.on('end', () => {
			// Process the received data here
			console.log('Received data:', body)

			// Send a response
			res.statusCode = 200
			res.setHeader('Content-Type', 'text/plain')
			res.end('OK')
		})
	} else {
		res.statusCode = 404
		res.end('Not Found')
	}
})

const port = 3663
server.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})
