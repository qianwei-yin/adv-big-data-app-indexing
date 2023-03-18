const Validator = require('jsonschema').Validator;
const memberCostShareValidator = new Validator();
const serviceValidator = new Validator();
const planServiceValidator = new Validator();
const planValidator = new Validator();

const memberCostShareSchema = {
	id: '/MemberCostShare',
	type: 'object',
	properties: {
		deductible: { type: 'number' },
		_org: { type: 'string' },
		copay: { type: 'number' },
		objectType: { type: 'string' },
	},
};

const serviceSchema = {
	id: '/Service',
	type: 'object',
	properties: {
		_org: { type: 'string' },
		objectType: { type: 'string' },
		name: { type: 'string' },
	},
};

const planServiceSchema = {
	id: '/PlanService',
	type: 'object',
	properties: {
		_org: { type: 'string' },
		objectType: { type: 'string' },
		linkedService: { $ref: '/Service' },
		planServiceCostShares: { $ref: '/MemberCostShare' },
	},
};

const planSchema = {
	id: '/Plan',
	type: 'object',
	properties: {
		_org: { type: 'string' },
		objectType: { type: 'string' },
		planStatus: { type: 'string' },
		creationDate: { type: 'string' },
		planCostShares: { $ref: '/MemberCostShare' },
		linkedPlanServices: {
			type: 'array',
			items: { $ref: '/PlanService' },
		},
	},
};

const topLevelPropertyNames = {
	plan: ['_org', 'objectType', 'planStatus'],
	planService: ['_org', 'objectType'],
	service: ['_org', 'objectType', 'name'],
	memberCostShare: ['_org', 'objectType', 'deductible', 'copay'],
};

planServiceValidator.addSchema(memberCostShareSchema, '/MemberCostShare');
planServiceValidator.addSchema(serviceSchema, '/Service');

planValidator.addSchema(memberCostShareSchema, '/MemberCostShare');
planValidator.addSchema(serviceSchema, '/Service');
planValidator.addSchema(planServiceSchema, '/PlanService');

module.exports = {
	memberCostShareValidator,
	memberCostShareSchema,
	serviceValidator,
	serviceSchema,
	planServiceValidator,
	planServiceSchema,
	planValidator,
	planSchema,
	topLevelPropertyNames,
};
