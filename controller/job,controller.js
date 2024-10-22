
// Function to get job status
exports.getJobStatus = async (req, res) => {
    try {
        const { job_id } = req.body; // Extract job_id from the request body

        // Validate job_id
        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        // Create the request object
        const request = { job_id }; 

        // Call the gRPC method
        imageProcessingClient.GetJobStatus(request, (error, response) => {
            if (error) {
                console.error("Error fetching job status:", error);
                return res.status(500).json({ error: 'Error fetching job status', details: error });
            }
            // Send the response back to the client
            res.json({
                job_id: response.job_id,
                percentage: response.percentage,
            });
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
