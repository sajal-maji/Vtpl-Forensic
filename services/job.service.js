const { channelServiceClient } = require('../grpcClient');

const getStatus = async (job_id) => {
    const request = { job_id };
    let data = channelServiceClient.GetJobStatus(request, (error, response) => {
        if (error) {
            console.error("Error fetching job status:", error);
            return { error: 'Error fetching job status', details: error };
        }
        return response;
    });
    return data;
};

module.exports = {
    getStatus
}