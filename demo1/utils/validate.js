const Validator = require('jsonschema').Validator;
const v = new Validator();

const memberCostShareSchema = {
	id: '/MemberCostShare',
	type: 'object',
	properties: {
		deductible: { type: 'number' },
		_org: { type: 'string' },
		copay: { type: 'number' },
		objectType: { type: 'string' },
	},
	required: ['deductible', '_org', 'copay'],
};

const serviceSchema = {
	id: '/Service',
	type: 'object',
	properties: {
		_org: { type: 'string' },
		objectType: { type: 'string' },
		name: { type: 'string' },
	},
	required: ['_org', 'name'],
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
	required: ['_org', 'linkedService', 'planServiceCostShares'],
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
	required: ['_org', 'planStatus', 'planCostShares', 'linkedPlanServices'],
};

const obj = {
	planCostShares: {
		deductible: 1000,
		_org: 'example.com',
		copay: 12,
		objectType: 'memberCostShare',
	},
	linkedPlanServices: [
		{
			linkedService: {
				_org: 'example.com',
				objectType: 'service',
				name: 'Yearly physical',
			},
			planServiceCostShares: {
				deductible: 30,
				_org: 'example2.com',
				copay: 34,
				objectType: 'memberCostShare',
			},
			_org: 'example.com',
			objectType: 'planService',
		},
		{
			linkedService: {
				_org: 'example.com',
				objectType: 'service',
				name: 'Yearly physical',
			},
			planServiceCostShares: {
				deductible: 50,
				_org: 'example3.com',
				copay: 56,
				objectType: 'memberCostShare',
			},
			_org: 'example.com',
			objectType: 'planService',
		},
		{
			linkedService: {
				_org: 'example.com',
				obrectType: 'service',
				name: 'well baby',
			},
			planServiceCostShares: {
				deductible: 70,
				_org: 'example4.com',
				copay: 78,
				objectType: 'memberCostShare',
			},
			_org: 'example.com',
			objectType: 'planService',
		},
	],
	_org: 'exampleee.com',
	objectType: 'plan',
	planStatus: 'inNetwork',
};

v.addSchema(memberCostShareSchema, '/MemberCostShare');
v.addSchema(serviceSchema, '/Service');
v.addSchema(planServiceSchema, '/PlanService');

module.exports = { validator: v, planSchema };
