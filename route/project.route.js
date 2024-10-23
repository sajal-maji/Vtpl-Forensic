const router = require('express').Router();
const { createCasefolder, getFolderAll, updateCasefolder } = require('../controller/casefolder.controller');
const { createProject, updateProject, deleteProject, uploadFiles, getProjectByCat, getProjectDetails, getAction, selectFream, discardFream, saveSnapImage } = require('../controller/project.controller');

router.post('/create-folder', createCasefolder);
router.put('/update-folder', updateCasefolder);
router.get('/all-folder', getFolderAll);

router.put('/create-project', createProject);
router.put('/update-project', updateProject);
router.delete('/delete-project', deleteProject);
router.post('/upload-files', uploadFiles);
router.get('/', getProjectByCat);
router.get('/project-details', getProjectDetails);
router.put('/undo-redo-action', getAction);
router.put('/select-image', selectFream);
router.put('/discard-image', discardFream);
router.put('/save-image', saveSnapImage);


module.exports = router;