const dotenv = require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

const PORT = 3000;

mongoose.connect(process.env.DATABASE).then(() => {
	console.log('Successfully connect to database!');
});

// start server
const server = app.listen(PORT, () => {
	console.log(`App running on port ${PORT}...`);
});
