const {filterOperation } = require('../utils/filterOperation');
const { AnnotationServiceClient } = require('../grpcClient');
const fs = require('fs');
const path = require('path'); 

const textAnnotation = async (req, res, next) => {
    try {
        const {black_bg_image:blackImage,white_bg_image:whiteImage } = req.body;
        const uploadDir = path.join(__dirname, '../public/uploads/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const blackPath = path.join(uploadDir, 'blackimage.png');
        const whitePath = path.join(uploadDir, 'whiteimage.png');

        const blackImg = await saveBase64Image(blackImage, blackPath);
        const whiteImg = await saveBase64Image(whiteImage, whitePath);

        // const savePath = path.join(__dirname, '../public/uploads/images', 'blackimage.png');
        // const blackImg = await saveBase64Image(blackImage, savePath);
        // const savePathWhite = path.join(__dirname, '../public/uploads/images', 'whiteimage.png');
        // const whiteImg = await saveBase64Image(whiteImage, savePathWhite);
        // res.status(200).json({ message: 'Image saved successfully','whiteImg':whiteImg });


        const requestObj = {
            white_img_path : whiteImg,
            black_img_path : blackImg
        };
        const response = await filterOperation(req,res,next, requestObj,AnnotationServiceClient,'AnnotationFilter','annotation');
        res.status(response.statusCode).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// const saveBase64Image = (base64Data, filePath) => {
//     // Remove base64 header if exists
//     const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
//     const buffer = Buffer.from(matches ? matches[2] : base64Data, 'base64');

//     fs.writeFileSync(filePath, buffer);
//     console.log('Image saved to:', filePath);
//     return filePath;
// };

const saveBase64Image = async (base64Data, filePath) => {
    if (!base64Data) {
        throw new Error('Base64 image data is missing');
    }

    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    const base64String = matches ? matches[2] : base64Data;

    const buffer = Buffer.from(base64String, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    return filePath;
};

module.exports = {
    textAnnotation
}

