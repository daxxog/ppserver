/* ppserver
 * (P)df (P)rint (SERVER)
 * (c) 2013 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

var opt = require('optimist')
	.alias('p', 'port')
	.describe('p', 'Port to listen on.')
	.default('p', 9999)
	
	.boolean('help')
	.describe('help', 'Show this page.')
	.usage('ppserver -p [ port number ]'),
	
	argv = opt.argv,
	express = require('express'),
	glob = require('glob'),
    fs = require('fs'),
    exec = require('child_process').exec;

if(argv.help) {
	opt.showHelp();
} else {
	var app = express();
		
	app.use(express.bodyParser());

	var packageDotJson = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')),
		_adobeReader = glob('/Program Files*/Adobe/Reader*/Reader/AcroRd32.exe', {sync: true}),
		adobeReader = _adobeReader.length > 0 ? _adobeReader[0] : false,
		server_info = {
			name: packageDotJson.name,
			description: packageDotJson.description,
			version: packageDotJson.version,
			port: argv.p,
			api: {
				post: {
					print: '/print'
				}
			},
			readerExe: adobeReader
		};

	app.get('/', function(req, res) {
		res.json(server_info);
	});

	app.post('/print', function(req, res) {
		if(adobeReader !== false) {
			if(typeof req.files.pdf == 'object') {
				exec('"'+adobeReader+'" /n /h /t ' + req.files.pdf.path, function() {});
				res.json(true);
			} else {
				res.json(false);
			}
		} else {
			res.json("Please install Adobe Reader on the server.");
		}
	});

	app.listen(argv.p);
	console.log('Started ppserver v'+server_info.version+' on ' + argv.p);
}