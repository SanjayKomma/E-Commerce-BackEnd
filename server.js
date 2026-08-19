const dns = require('dns');
const app = require("./app");
const cors = require('cors');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MONGODB_URI, PORT, HOST, CLIENT_URL } = require('./utils/config');
const mongoose = require('mongoose');
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app
            .listen(PORT, ()=>{
                console.log(`Server is running on port http://${PORT}`);
            })
            .on('error', (err) => {
                console.log("Error in server", err);
            });
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err.message);
    });
