const dns = require('dns');
const app = require("./app");
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MONGODB_URI, PORT, HOST } = require('./utils/config');
const mongoose = require('mongoose');
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app
            .listen(PORT, HOST, ()=>{
                console.log(`Server is running on port http://${HOST}:${PORT}`);
            })
            .on('error', (err) => {
                console.log("Error in server", err);
            });
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err.message);
    });