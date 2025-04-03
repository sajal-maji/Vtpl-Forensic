const jobService = require("../services/job.service");

const getJobStatus = async (req, res, next) => {
    const { job_id } = req.query;
    try {
        if (!job_id) {
            return res.status(400).json({ statusCode: 400,error: 'Job ID is required' });
        }
        const response = await jobService.getStatus(job_id, req.user.id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

module.exports = {
    getJobStatus
};
