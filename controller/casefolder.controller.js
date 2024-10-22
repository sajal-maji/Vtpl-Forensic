const Casefolder = require('../model/casefolder.model');
const { where } = require('../model/user.model');

exports.getFolderAll = async (req, res, next) => {
    
    try {
        const casefolder = await Casefolder.find({'userId':req.user.id}).select('folderName').sort({ createdAt: -1 });
        if (!casefolder) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            casefolder
        })
    } catch (error) {
        next(error);
    }
    
}

exports.createCasefolder = async (req, res, next) => {
    try {
        const {folderName} = req.body;
        const max=5667722;
        const slag = Math.floor(Math.random() * max);
        const casefolder = new Casefolder({
            folderName,
            userId:req.user.id,
            slag:slag
        })

        await casefolder.save();

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully created Folder.',
            casefolder
        })
    } catch (error) {
        next(error);
    }
}

exports.updateCasefolder = async (req, res, next) => {
    try {
        const {folderName,id} = req.body;
        const casefolder = await Casefolder.findByIdAndUpdate(id, {'folderName':folderName}, { new: true });
        
        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Update Successfully.',
            casefolder
        })
    } catch (error) {
        next(error);
    }
    
}