const express = require('express');
const morgan = require('morgan');
const fs = require('fs');

const planRouter = require('./routes/planRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

const plan = JSON.parse(fs.readFileSync(`${__dirname}/temp.json`));

app.use(express.json({ limit: '16kb' }));

// app.get('/api/v1/plans', (req, res, next) => {
// 	res.status(200).json({
// 		status: 'success',
// 		data: { plan },
// 	});
// });
app.use('/api/v1/plans', planRouter);

// app.all('*', (req, res, next) => {
// 	next(new Error(`Can't find ${req.originalUrl} on this server.`));
// });

module.exports = app;
