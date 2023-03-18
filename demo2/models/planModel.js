const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
	{
		planCostShares: { type: mongoose.Schema.ObjectId, ref: 'MemberCostShare' },
		linkedPlanServices: [{ type: mongoose.Schema.ObjectId, ref: 'PlanService' }],
		_org: {
			type: String,
			required: [true, 'Please provide _org property.'],
		},
		objectType: {
			type: String,
			default: 'plan',
		},
		planStatus: {
			type: String,
			required: [true, 'Please provide planStatus property.'],
		},
		// creationDate: {
		// 	type: Date,
		// 	default: Date.now(),
		// },
	},
	{ timestamps: true }
);

// planSchema.pre(/^find/, function (next) {
// 	this.populate({
// 		path: 'linkedPlanServices',
// 	});
// 	next();
// });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
