const mongoose = require('mongoose');

const Service = require('./serviceModel');
const MemberCostShare = require('./memberCostShareModel');

const planServiceSchema = new mongoose.Schema({
	linkedService: { type: mongoose.Schema.ObjectId, ref: 'Service' },
	planServiceCostShares: { type: mongoose.Schema.ObjectId, ref: 'MemberCostShare' },
	_org: {
		type: String,
		required: [true, 'Please provide _org property.'],
	},
	objectType: {
		type: String,
		default: 'planService',
	},
});

planServiceSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'linkedService',
	}).populate({
		path: 'planServiceCostShares',
	});
	next();
});

const PlanService = mongoose.model('PlanService', planServiceSchema);

module.exports = PlanService;
