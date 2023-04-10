const etag = require('etag');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const MemberCostShare = require('../models/memberCostShareModel');
const Plan = require('../models/planModel');
const PlanService = require('../models/planServiceModel');
const Service = require('../models/serviceModel');
const {
	memberCostShareValidator,
	memberCostShareSchema,
	serviceValidator,
	serviceSchema,
	planServiceValidator,
	planServiceSchema,
	planValidator,
	planSchema,
	topLevelPropertyNames,
} = require('../utils/validate');

const parseBodyAndCreate = async (body) => {
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

	return newPlan_display;
};

exports.createPlan = async (req, res, next) => {
	try {
		const { errors } = planValidator.validate(req.body, planSchema);

		if (errors.length > 0) {
			res.status(400).json(errors.map((err) => err.stack).join(' & '));
			return;
		}

		const newPlan_display = await parseBodyAndCreate(req.body);

		res.status(201).json(newPlan_display);
	} catch (error) {
		if (error.name === 'ValidationError') res.status(400).send(error.message);
		else res.status(500).send('Something went wrong, please try again later.');
	}
};

exports.getPlan = async (req, res, next) => {
	const reqETag = req.headers['if-none-match'];
	const planId = req.params.id;
	try {
		const oldPlan = await Plan.findById(planId).populate('linkedPlanServices').populate('planCostShares');
		if (!oldPlan) {
			res.status(404).send('Cannot find plan with this id.');
			return;
		}

		const oldETag = etag(JSON.stringify(oldPlan), { weak: true });
		if (reqETag === oldETag) {
			res.status(304).send("The resource isn't modified.");
			return;
		}
	} catch (error) {
		console.log(error);
		if (error.name === 'CastError') {
			res.status(400).send('The id is invalid.');
			return;
		} else {
			res.status(500).send('Something went wrong, please try again later.');
			return;
		}
	}

	try {
		let query = Plan.findById(req.params.id);
		query = query.populate('linkedPlanServices').populate('planCostShares');
		const plan = await query;

		if (!plan) {
			// return next('No plan found with the id.');
			res.status(404).send('No plan found with this id.');
		}

		res.status(200).json(plan);
	} catch (error) {
		if (error.name === 'CastError') res.status(500).send('Invalid id.');
		else res.status(500).send('Something goes wrong.');
	}
};

exports.deletePlan = async (req, res, next) => {
	const plan = await Plan.findByIdAndDelete(req.params.id);

	if (!plan) {
		res.status(404).send('No plan found with this id.');
	}

	res.status(204).send();
};

exports.updatePlan = async (req, res) => {
	const reqETag = req.headers['if-match'];

	const planId = req.params.id;
	const content = req.body;

	try {
		const oldPlan = await Plan.findById(planId).populate('linkedPlanServices').populate('planCostShares');
		if (!oldPlan) {
			res.status(404).send('Cannot find plan with this id.');
			return;
		}

		const oldETag = etag(JSON.stringify(oldPlan), { weak: true });
		if (reqETag !== oldETag) {
			res.status(412).send('The resource has been modified.');
			return;
		}
	} catch (error) {
		console.log(error);
		if (error.name === 'CastError') {
			res.status(400).send('The id is invalid.');
			return;
		} else {
			res.status(500).send('Something went wrong, please try again later.');
			return;
		}
	}

	const { errors } = planValidator.validate(content, planSchema);
	if (errors.length > 0) {
		res.status(400).json(errors.map((err) => err.stack).join(' & '));
		return;
	}

	// UPDATE
	// top-level
	try {
		const oldPlan = await Plan.findById(planId);
		topLevelPropertyNames.plan.forEach((name) => {
			if (content[name]) {
				oldPlan[name] = content[name];
			}
		});
		await oldPlan.save();
		console.log('top-level ok');
	} catch (error) {
		res.status(500).send('Something went wrong, please try again later.');
		return;
	}

	if (content.linkedPlanServices) {
		for (let i = 0; i < content.linkedPlanServices.length; i++) {
			try {
				console.log(`${i} start`);
				const el = content.linkedPlanServices[i];
				if (el._id) {
					// check id
					const oldLinkedPlanService = await PlanService.findById(el._id);
					if (!oldLinkedPlanService) {
						// throw new Error(`Cannot find any linkedPlanService with id: ${el._id}`);
						res.status(400).send(`Cannot find any linkedPlanService with id: ${el._id}`);
						break;
					}

					// update
					const oldLinkedServiceId = oldLinkedPlanService.linkedService._id;
					const oldPlanServiceCostSharesId = oldLinkedPlanService.planServiceCostShares._id;
					console.log('ids get');

					// planService-level
					topLevelPropertyNames.planService.forEach((name) => {
						if (el[name]) {
							oldLinkedPlanService[name] = el[name];
						}
					});
					await oldLinkedPlanService.save();
					console.log('planService-level ok');

					// service-level
					const oldLinkedService = await Service.findById(oldLinkedServiceId);
					topLevelPropertyNames.service.forEach((name) => {
						if (el?.linkedService[name]) {
							oldLinkedService[name] = el.linkedService[name];
						}
					});
					await oldLinkedService.save();
					console.log('service-level ok');

					// memberCostShare-level
					const oldPlanServiceCostShares = await MemberCostShare.findById(oldPlanServiceCostSharesId);
					topLevelPropertyNames.memberCostShare.forEach((name) => {
						if (el?.planServiceCostShares[name]) {
							oldPlanServiceCostShares[name] = el.planServiceCostShares[name];
						}
					});
					await oldPlanServiceCostShares.save();
					console.log('memberCostShare-level ok');
				} else {
					// add
					const newService = await Service.create(el.linkedService);
					const newMemberCostShare = await MemberCostShare.create(el.planServiceCostShares);
					const newPlanService = await PlanService.create({
						linkedService: newService._id,
						planServiceCostShares: newMemberCostShare._id,
						_org: el._org,
						objectType: el.objectType,
					});
					await Plan.findByIdAndUpdate(planId, { $push: { linkedPlanServices: newPlanService._id } });
				}
				console.log(`${i} ok`);
			} catch (error) {
				if (error.name === 'ValidationError') res.status(400).send(error.message);
				else res.status(500).send('Something went wrong, please try again later.');
				return;
			}
		}
	}

	const newPlan_display = await Plan.findById(planId).populate('linkedPlanServices').populate('planCostShares');
	res.status(200).json(newPlan_display);
};

exports.verifyToken = (req, res, next) => {
	if (!req.headers.authorization) {
		res.status(401).send('Not authorized to perform this action.');
		return;
	}

	const token = req.headers.authorization.split(' ')[1];
	async function verify() {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
			// Or, if multiple clients access the backend:
			//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
		});
		const payload = ticket.getPayload();
		const userid = payload['sub'];
		// If request specified a G Suite domain:
		// const domain = payload['hd'];
	}

	verify()
		.then(() => {
			next();
		})
		.catch(() => {
			res.status(401).send('Your session is invalid or has expired.');
		});
};
