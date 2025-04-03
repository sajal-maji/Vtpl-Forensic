const Casefolder = require('../model/casefolder.model');
const { where } = require('../model/user.model');
const Project = require('../model/projects.model');

const getFolder = async (req) => {
    const casefolderOthers = await Casefolder.find({ 'userId': req.user.id,'status':'active','slag':'others' }).select('folderName').sort({ createdAt: -1 });
    const casefolderInbox = await Casefolder.find({ 'userId': req.user.id,'status':'active',slag: { $ne: 'others' }  }).select('folderName').sort({ createdAt: 1 });
    const casefolder = [...casefolderInbox, ...casefolderOthers];
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
        casefolder:casefolder
    };
};

const createFolder = async (req, folderName) => {
    const max = 5667722;
    const slag = Math.floor(Math.random() * max);
    const casefolder = new Casefolder({
        folderName,
        userId: req.user.id,
        // slag: slag
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

const deleteFolder = async (req,id) => {
    const casefolder = await Casefolder.findByIdAndUpdate(id,{'status':'deleted'}, { new: true });
    if (!casefolder) {
        // const result = await Project.deleteMany({ catId: id });
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Casefolder not found',
        };
    }
    const casefolderRecyle = await Casefolder.findOne({ 'userId': req.user.id,slag: 'recyclebin' });
    const catId=casefolderRecyle.id
    const result = await Project.updateMany({ catId: id },{'status':'deleted','catId':catId});
    console.log(`${result.nModified} documents updated.`);
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Casefolder deleted successfully.',
    };
};

module.exports = {
    getFolder,
    createFolder,
    updateFolder,
    deleteFolder
}