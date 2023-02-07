const mongoose = require('mongoose');

const memberCostShareSchema = new mongoose.Schema({
	deductible: {
		type: Number,
		required: [true, 'Please provide deductible property.'],
	},
	_org: {
		type: String,
		required: [true, 'Please provide _org property.'],
	},
	copay: {
		type: Number,
		required: [true, 'Please provide copay property.'],
	},
	objectType: {
		type: String,
		default: 'memberCostShare',
	},
});

const MemberCostShare = mongoose.model('MemberCostShare', memberCostShareSchema);

module.exports = MemberCostShare;
