import http from 'http'
import fs from 'fs'

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		let body = ''

		req.on('data', (chunk) => {
			body += chunk
		})

		req.on('end', () => {
			// read .env file using fs
			const env = fs.readFileSync('.env', 'utf-8')
			// parse the content of the .env file
			const envLines = env.split('\n')
			const envVars = {}
			envLines.forEach((line) => {
				const [key, value] = line.split('=')
				envVars[key] = value
			})
			// compare body with the secret key
			if (body === envVars.PULL_TOKEN) {
				// print user under which the hook is running
				console.log('Current user: ', process.env.USER)
			} else {
				console.log('Invalid secret key')
			}

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
