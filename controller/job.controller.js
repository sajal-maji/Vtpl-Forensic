const jobService = require("../services/job.service");

const getJobStatus = async (req, res, next) => {
    const { job_id } = req.user;
    try {
        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }
        const response = await jobService.getStatus(job_id);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getJobStatus
};
