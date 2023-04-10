const express = require('express');

const { getPlan, createPlan, deletePlan, updatePlan, verifyToken } = require('../controllers/planController');

const router = express.Router();

router.route('/').post(verifyToken, createPlan);
router.route('/:id').get(verifyToken, getPlan).delete(verifyToken, deletePlan).patch(verifyToken, updatePlan);

module.exports = router;
