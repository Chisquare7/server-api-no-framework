const http = require('http');
const fs = require('fs');
const path = require('path');

const portServer = 8001


/* ----------------------------------------The Handlers ---------------------------------------------------- */

const sendWeb = (req, res) => {
    const webRenderPath = path.join(__dirname, "index.html");
    const accessPath = fs.readFileSync(webRenderPath);
    res.setHeader("content-type", "text/html");
    res.writeHead(200);
    res.write(accessPath);
    res.end();
}

const accessWebPage = (req, res) => {
    
    const urlSplit = req.url.split('/');
    const urlName = urlSplit[1];
    const webPath = path.join(__dirname, urlName);

    try {
        const mainWebPath = fs.readFileSync(webPath);
        // res.setHeader("content-type", "text/html");
        // res.writeHead(200);
        res.write(mainWebPath);
        res.end();
    } catch (error) {
        checkErrorPage(req, res);
    }
}

const checkErrorPage = (req, res) => {
	const errorRenderPath = path.join(__dirname, "error404.html");
	const errorPath = fs.readFileSync(errorRenderPath);
	res.setHeader("content-type", "text/html");
	res.writeHead(404);
	res.write(errorPath);
	res.end();
};



/* ------------------------------------------------ Server Request Handlers -------------------------------------------- */

const serverRequestHandler = (req, res) => {
    if (req.url === '/') {
        sendWeb(req, res);
    }

    if (req.url.endsWith('.html') && req.method === 'GET') {
        try {
            accessWebPage(req, res);
        } catch (error) {
            checkErrorPage(req, res);
        }
    } else {
        checkErrorPage(req, res);
    }
}


const server = http.createServer(serverRequestHandler);

server.listen(portServer, () => {
    console.log(`Server is running on port: ${portServer}`);
});