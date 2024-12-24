const caseFolderService = require("../services/casefolder.service");

const getFolderAll = async (req, res, next) => {
    try {
        const response = await caseFolderService.getFolder(req);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const createCasefolder = async (req, res, next) => {
    const { folderName } = req.body;
    try {
        const response = await caseFolderService.createFolder(req, folderName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const updateCasefolder = async (req, res, next) => {
    const { folderName, id } = req.body;
    try {
        const response = await caseFolderService.updateFolder(id, folderName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
}

const deleteCaseFolder = async (req, res, next) => {
    const {id } = req.body;
    try {
        const response = await caseFolderService.deleteFolder(req,id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = {
    getFolderAll,
    createCasefolder,
    updateCasefolder,
    deleteCaseFolder
}