const Imageoperation = require('../model/imageoperation.model');

const createOperation = async (dataObj) => {
    console.log('operation Data',dataObj);
    const imageope = new Imageoperation(dataObj);
    await imageope.save();
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully created.',
    }
};

module.exports = {
    createOperation
}