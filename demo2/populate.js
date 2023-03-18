const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MemberCostShare = require('./models/memberCostShareModel');
const Plan = require('./models/planModel');
const PlanService = require('./models/planServiceModel');
const Service = require('./models/serviceModel');

dotenv.config();

mongoose.connect(process.env.DATABASE).then(() => {
	console.log('DB connection successful!');
});

const deleteData = async () => {
	try {
		await MemberCostShare.deleteMany();
		await Plan.deleteMany();
		await PlanService.deleteMany();
		await Service.deleteMany();

		console.log(
			`
			***************************************************************************
			                   Successfully deleted existed data!
			***************************************************************************
			`
		);
	} catch (error) {
		console.log(error);
	}
	process.exit();
};

if (process.argv[2] === '--import') {
	importData();
} else if (process.argv[2] === '--delete') {
	deleteData();
}
