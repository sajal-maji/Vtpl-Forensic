const router = require('express').Router();
// const Imagefilter = require('../model/imagefilter.model');

// router.put('/add-field', async (req, res) => {
//     try {
//         const fieldName = req.body.fieldName;
//         const defaultValue = req.body.defaultValue;

//         // Add a new field to all documents
//         const result = await Imagefilter.updateMany({}, { $set: { [fieldName]: defaultValue } });
//         res.status(200).json({
//             message: `Added new field to ${result.modifiedCount} documents.`,
//         });
//     } catch (error) {
//         console.error('Error adding new field:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
 
module.exports = router;