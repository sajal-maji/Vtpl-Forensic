const projectService = require("../services/project.service");

const createProject = async (req, res, next) => {
    const { projectName, catId } = req.body;
    try {
        const response = await projectService.createProject(req, catId, projectName);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const updateProject = async (req, res, next) => {
    const { id, projectName } = req.body;
    try {
        const response = await projectService.updateProject(id, projectName);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const deleteProject = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const response = await projectService.deleteProject(id);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const uploadFiles = async (req, res, next) => {
    const { catId } = req.query;
    const totalSeconds = (req.query.startTime) ? req.query.startTime : 0;
    try {
        const response = await projectService.uploadFiles(req, catId, totalSeconds);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const getProjectByCat = async (req, res, next) => {
    const { catId } = req.query;
    try {
        const projectList = await projectService.projectList(req, catId);
        res.status(201).json(projectList)
    } catch (error) {
        next(error);
    }
};

const getProjectDetails = async (req, res, next) => {
    const { projectId: id } = req.query;
    try {
        const projectDetails = await projectService.projectDetails(req, id);
        res.status(201).json(projectDetails)
    } catch (error) {
        next(error);
    }
};

const getAction = async (req, res, next) => {
    const { projectId: id, actionType } = req.body;
    try {
        const applyChanges = '';
        if (actionType === 'Undo') {
            applyChanges = await projectService.applyUndoAction(id, actionType);
        } else if (actionType === 'Redo') {
            applyChanges = await projectService.applyRedoAction(id, actionType);
        }
        res.status(201).json(applyChanges)
    } catch (error) {
        next(error);
    }
};

const selectFream = async (req, res, next) => {
    const { projectId: id, frameId } = req.body;
    try {
        const selectThumbnailFrame = await projectService.selectThumbnailFrame(req, id, frameId);
        res.status(201).json(selectThumbnailFrame)
    } catch (error) {
        next(error);
    }
};

const discardFream = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const discardImage = await projectService.discardImage(id);
        res.status(201).json(discardImage)
    } catch (error) {
        next(error);
    }
};

const saveSnapImage = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const saveImage = await projectService.saveImage(req, id);
        res.status(201).json(saveImage)
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createProject,
    updateProject,
    deleteProject,
    uploadFiles,
    getProjectByCat,
    getProjectDetails,
    getAction,
    selectFream,
    discardFream,
    saveSnapImage
};