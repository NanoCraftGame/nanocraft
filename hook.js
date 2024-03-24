import http from 'http'
import fs from 'fs'
import { exec } from 'child_process'
import path from 'path'

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		console.log('POST request received')
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
			console.log('env read')
			// compare body with the secret key
			if (body === envVars.PULL_TOKEN) {
				// run the script
				console.log('starting script execution')
				exec(path.join(process.cwd(), 'deploy.sh'), (error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`)
						res.statusCode = 500
						res.end('Internal Server Error')
						return
					}
					console.log(`stdout: ${stdout}`)
					console.error(`stderr: ${stderr}`)

					res.statusCode = 200
					res.setHeader('Content-Type', 'text/plain')
					res.end('OK')
				})
			} else {
				console.log('Invalid secret key')
				res.statusCode = 401
				res.end('Unauthorized')
			}
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
