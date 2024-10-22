const router = require('express').Router();
const { createCasefolder,getFolderAll, updateCasefolder } = require('../controller/casefolder.controller');
const { getProjectByCat,createProject, updateProject, uploadFiles,getProjectDetails,getCloneImage,SaveSnapImage,getUpdoRedo,getUndo,getRedo,getSaveImagePossible,getDiscardImage,deleteProject } = require('../controller/project.controller');

router.post('/create-folder', createCasefolder);
router.put('/update-folder', updateCasefolder);
router.get('/all-folder', getFolderAll);

router.put('/create-project', createProject);
router.put('/update-project', updateProject);
router.delete('/delete-project', deleteProject);
router.get('/', getProjectByCat);
router.post('/upload-files', uploadFiles);
router.get('/project-details', getProjectDetails);
router.put('/select-image', getCloneImage);
router.put('/save-image', SaveSnapImage);
router.put('/undo-redo-possible', getUpdoRedo);
router.put('/undo', getUndo);
router.put('/redo', getRedo);
router.put('/save-image-possible', getSaveImagePossible);
router.put('/discard-image', getDiscardImage);


module.exports = router;