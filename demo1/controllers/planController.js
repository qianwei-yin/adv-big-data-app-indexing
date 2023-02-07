const MemberCostShare = require('../models/memberCostShareModel');
const Plan = require('../models/planModel');
const PlanService = require('../models/planServiceModel');
const Service = require('../models/serviceModel');

exports.test = (req, res, next) => {
	res.send('Hello!');
};

exports.createPlan = async (req, res, next) => {
	try {
		const body = req.body;

		const pcs_mcs = body.planCostShares;
		const lps_array = body.linkedPlanServices;
		const ls_s_array = lps_array.map((el) => el.linkedService);
		const pscs_mcs_array = lps_array.map((el) => el.planServiceCostShares);

		const newPlanCostShares = await MemberCostShare.create(pcs_mcs);
		const newLinkedServices = await Service.create(ls_s_array);
		const newPlanServiceCostShares = await MemberCostShare.create(pscs_mcs_array);

		// Build out the linkedPlanServices array that is going to store in the database
		const lps_array_ = lps_array.map((el, index) => {
			return {
				linkedService: newLinkedServices[index]._id,
				planServiceCostShares: newPlanServiceCostShares[index]._id,
				_org: el._org,
			};
		});
		const newLinkedPlanServicesIds = await PlanService.create(lps_array_);

		// Build out the plan that is going to store in the database
		const plan_ = {
			planCostShares: newPlanCostShares._id,
			linkedPlanServices: newLinkedPlanServicesIds.map((el) => el._id),
			_org: body._org,
			planStatus: body.planStatus,
		};
		const newPlan = await Plan.create(plan_);

		let query = Plan.findById(newPlan._id);
		query = query.populate('linkedPlanServices').populate('planCostShares');
		const newPlan_display = await query;

		res.status(201).json({
			status: 'success',
			data: { plan: newPlan_display },
		});
	} catch (error) {
		console.log(error);
		return next(error.message);
	}
};

exports.getPlan = async (req, res, next) => {
	try {
		let query = Plan.findById(req.params.id);
		query = query.populate('linkedPlanServices').populate('planCostShares');
		const plan = await query;

		if (!plan) {
			return next('No plan found with the id.');
		}

		res.status(200).json({
			status: 'success',
			data: { plan },
		});
	} catch (error) {
		console.log(error);
		return next(error.message);
	}
};

exports.deletePlan = async (req, res, next) => {
	const plan = await Plan.findByIdAndDelete(req.params.id);

	if (!plan) {
		return next('No plan found with the id.');
	}

	res.status(204).json({
		status: 'success',
		data: null,
	});
};
