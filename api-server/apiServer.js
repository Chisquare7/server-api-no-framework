const http = require('http');
const fs = require('fs');
const path = require('path');

const portServer = 3001

const inventoryPath = path.join(__dirname, "inventory.json");


/* ------------------------------- The API Handlers functions------------------------------------------------- */

// 1. Post An Item

const createItem = (req, res) => {
    const readItem = fs.readFileSync(inventoryPath);
    const itemsObjArray = JSON.parse(readItem);

    const lastItemId = itemsObjArray[itemsObjArray.length - 1].id
    const newItemId = lastItemId + 1;

    const preBody = [];
    req.on("data", (chunk) => {
        preBody.push(chunk);
    });

    req.on("end", () => {
        const postBody = Buffer.concat(preBody).toString();
        const itemToCreate = JSON.parse(postBody);

        itemsObjArray.push({ ...itemToCreate, id: newItemId });

        fs.writeFile(inventoryPath, JSON.stringify(itemsObjArray), (error) => {
            if (error) {
                apiInternalError();
            }

            res.end(JSON.stringify(itemToCreate));
        });
    });
}


// 2. Get All Items

const retrieveAllInventory = (req, res) => {
    fs.readFile(inventoryPath, "utf8", (error, data) => {
        if (error) {
            apiInternalError();
        }
        res.end(data);
    });
}


// 3. Get One Item

const retrieveOneOfInventory = (req, res) => {
    const urlSplit = req.url.split("/");
    const inventoryId = urlSplit[2];
    
    const readItem = fs.readFileSync(inventoryPath);
    const itemsObjArray = JSON.parse(readItem);
    const inventoryIndex = itemsObjArray.findIndex((item) => {
        return item.id === parseInt(inventoryId)
    });

    if (inventoryIndex === -1) {
        requestClientError();
    }

    res.end(JSON.stringify(itemsObjArray[inventoryIndex]));
}


// 4. Update An Item

const updateInventoryItem = (req, res) => {
    const urlSplit = req.url.split("/");
    const inventoryId = urlSplit[2];

    const readItem = fs.readFileSync(inventoryPath);
    const itemsObjArray = JSON.parse(readItem);

    const preBody = [];
    req.on("data", (chunk) => {
        preBody.push(chunk);
    });

    req.on("end", () => {
        const postBody = Buffer.concat(preBody).toString();
        const itemToUpdate = JSON.parse(postBody);

        const inventoryIndex = itemsObjArray.findIndex((item) => {
            return item.id === parseInt(inventoryId);
        });

        if (inventoryIndex == -1) {
            res.end("Inventory Item Not Found");
        }

        itemsObjArray[inventoryIndex] = { ...itemsObjArray[inventoryIndex], ...itemToUpdate };

        fs.writeFile(inventoryPath, JSON.stringify(itemsObjArray), (error) => {
            if (error) {
                apiInternalError();
            }

            res.end(JSON.stringify(itemsObjArray[inventoryIndex]));
        })
    })
}


// 5. Delete An Item

const deleteInventoryItem = (req, res) => {
    const urlSplit = req.url.split("/");
    const inventoryId = urlSplit[2];

    const readItem = fs.readFileSync(inventoryPath);
    const itemsObjArray = JSON.parse(readItem);

    const inventoryIndex = itemsObjArray.findIndex((item) => {
        return item.id === parseInt(inventoryId);
    });

    if (inventoryIndex == -1) {
        res.end("Inventory Item Not Found");
    }

    itemsObjArray.splice(inventoryIndex, 1);

    fs.writeFile(inventoryPath, JSON.stringify(itemsObjArray), (error) => {
        if (error) {
            apiInternalError();
        }

        res.end("Inventory Item deleted successfully");
    });
}


/* -------------------------------------- API Error Handler ---------------------------------------------- */

const apiInternalError = (req, res) => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end("Internal Server Error");
}

const requestClientError = (req, res) => {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end("Inventory Items Not Found")
}

/* -------------------------------------- API Request Handler ---------------------------------------------*/

const apiRequestHandler = (req, res) => {
    if (req.url === "/inventory" && req.method === "POST"){
        createItem(req, res);
    }

    if (req.url === "/inventory" && req.method === "GET") {
        retrieveAllInventory(req, res);
    }

    if (req.url.startsWith("/inventory/") && req.method === "GET") {
			retrieveOneOfInventory(req, res);
    }

    if (req.url.startsWith("/inventory/") && req.method === "PATCH") {
			updateInventoryItem(req, res);
    }

    if (req.url.startsWith("/inventory/") && req.method === "DELETE") {
        deleteInventoryItem(req, res);
    }
}

const apiServer = http.createServer(apiRequestHandler);

apiServer.listen(portServer, () => {
    console.log(`API server is running on port: ${portServer}`);
});