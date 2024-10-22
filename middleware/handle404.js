const handle404 = (req, res) => {
    res.status(404).json({
        statusCode: 404,
        status: 'Not Found',
        message: 'Route not found'
    })
}

module.exports = handle404;