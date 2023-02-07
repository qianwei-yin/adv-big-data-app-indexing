const express = require('express');

const { test, getPlan, createPlan, deletePlan } = require('../controllers/planController');

const router = express.Router();

router.route('/').get(test).post(createPlan);
router.route('/:id').get(getPlan).delete(deletePlan);

module.exports = router;
