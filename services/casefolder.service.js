const Casefolder = require('../model/casefolder.model');
const { where } = require('../model/user.model');

const getFolder = async (req) => {
    const casefolder = await Casefolder.find({ 'userId': req.user.id }).select('folderName').sort({ createdAt: -1 });
    if (!casefolder) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        casefolder
    };
};

const createFolder = async (req, folderName) => {
    const max = 5667722;
    const slag = Math.floor(Math.random() * max);
    const casefolder = new Casefolder({
        folderName,
        userId: req.user.id,
        slag: slag
    });
    await casefolder.save();

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully created Folder.',
        casefolder
    }
};

const updateFolder = async (id, folderName) => {
    const casefolder = await Casefolder.findByIdAndUpdate(id, { 'folderName': folderName }, { new: true });
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Update Successfully.',
        casefolder
    }
};

module.exports = {
    getFolder,
    createFolder,
    updateFolder
}