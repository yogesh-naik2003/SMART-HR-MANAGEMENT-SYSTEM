const express =
require("express");

const router =
express.Router();

const recruitmentController =
require("../controllers/recruitmentController");
const authMiddleware =
require("../middleware/authMiddleware");
const roleMiddleware =
require("../middleware/roleMiddleware");

/**
 * @swagger
 * /api/recruitment/jobs:
 *   post:
 *     summary: Create Job Post
 *     tags:
 *       - Recruitment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Job created
 */
router.get(
 "/jobs",
 authMiddleware,
 recruitmentController.getJobs
);

router.post(
 "/jobs",
 authMiddleware,
 roleMiddleware("ADMIN", "HR_RECRUITER"),
 recruitmentController.createJob
);

router.put(
 "/jobs/:id",
 authMiddleware,
 roleMiddleware(1),
 recruitmentController.updateJob
);

router.delete(
 "/jobs/:id",
 authMiddleware,
 roleMiddleware(1),
 recruitmentController.deleteJob
);

/**
 * @swagger
 * /api/recruitment/candidates:
 *   post:
 *     summary: Create Candidate
 *     tags:
 *       - Recruitment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Candidate created
 */
router.get(
 "/candidates",
 authMiddleware,
 recruitmentController.getCandidates
);

router.get(
 "/funnel",
 authMiddleware,
 recruitmentController.getFunnel
);

router.post(
 "/candidates",
 authMiddleware,
 roleMiddleware("ADMIN", "HR_RECRUITER"),
 recruitmentController.createCandidate
);

router.put(
 "/candidates/:id",
 authMiddleware,
 roleMiddleware(1),
 recruitmentController.updateCandidate
);

router.delete(
 "/candidates/:id",
 authMiddleware,
 roleMiddleware(1),
 recruitmentController.deleteCandidate
);

/**
 * @swagger
 * /api/recruitment/apply:
 *   post:
 *     summary: Apply Candidate to Job
 *     tags:
 *       - Recruitment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Application created
 */
router.post(
 "/apply",
 authMiddleware,
 recruitmentController.applyJob
);

/**
 * @swagger
 * /api/recruitment/interviews:
 *   post:
 *     summary: Schedule Interview
 *     tags:
 *       - Recruitment
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Interview scheduled
 */
router.post(
 "/interviews",
 authMiddleware,
 roleMiddleware(1),
 recruitmentController.scheduleInterview
);

module.exports = router;
