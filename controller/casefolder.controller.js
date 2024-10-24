const caseFolderService = require("../services/casefolder.service");

const getFolderAll = async (req, res, next) => {
    try {
        const response = await caseFolderService.getFolder(req);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const createCasefolder = async (req, res, next) => {
    const { folderName } = req.body;
    try {
        const response = await caseFolderService.createFolder(req, folderName);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const updateCasefolder = async (req, res, next) => {
    const { folderName, id } = req.body;
    try {
        const response = await caseFolderService.updateFolder(id, folderName);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFolderAll,
    createCasefolder,
    updateCasefolder
}