const express = require('express');

const { getPlan, createPlan, deletePlan } = require('../controllers/planController');

const router = express.Router();

router.route('/').post(createPlan);
router.route('/:id').get(getPlan).delete(deletePlan);

module.exports = router;
