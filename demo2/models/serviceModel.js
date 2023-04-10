const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
	_org: {
		type: String,
		required: [true, 'Please provide _org property.'],
	},
	objectType: {
		type: String,
		default: 'service',
	},
	name: {
		type: String,
		required: [true, 'Please provide name property.'],
	},
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
