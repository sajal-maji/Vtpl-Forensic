const router = require('express').Router();
const { createCasefolder, getFolderAll, updateCasefolder, deleteCaseFolder } = require('../controller/casefolder.controller');
const { createProject,moveProject,cleanProject,getDeletedProjectByCat,shareProjectToUser,draganddropProject, updateProject,exportProject, deleteProject,getRecentProject, uploadFiles, getProjectByCat, getProjectDetails, imageComparison, getAction, selectFream, discardFream, saveSnapImage, resetPointer, operationHistory, filesList, deleteImage, revertOperation } = require('../controller/project.controller');

router.post('/create-folder', createCasefolder);
router.put('/update-folder', updateCasefolder);
router.get('/all-folder', getFolderAll);

router.put('/create-project', createProject);
router.put('/update-project', updateProject);
router.delete('/delete-project', deleteProject);
router.delete('/delete-folder', deleteCaseFolder);
router.post('/upload-files', uploadFiles);
router.get('/', getProjectByCat);
router.get('/recent-project', getRecentProject);
router.get('/project-details', getProjectDetails);
router.put('/undo-redo-action', getAction);
router.put('/select-image', selectFream);
router.put('/discard-image', discardFream);
router.put('/save-image', saveSnapImage);
router.put('/reset-pointer', resetPointer);
router.get('/operation-history', operationHistory);
router.get('/file-list', filesList);
router.get('/image-comparison', imageComparison);
router.delete('/delete-image', deleteImage);
router.put('/revert-operation', revertOperation);
router.get('/export-files', exportProject);
router.get('/deleted-project', getDeletedProjectByCat);
router.put('/share-project', shareProjectToUser);
router.put('/drag-and-drop', draganddropProject);
router.put('/move-project', moveProject);
router.put('/clean-project', cleanProject);

module.exports = router;