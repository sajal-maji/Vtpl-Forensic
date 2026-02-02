const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { Zip } = require('zip-lib');
const crypto = require('crypto');
const { exec } = require('child_process');
const unzipper = require('unzipper');
const multer = require('multer');
// const dayjs = require('dayjs');
const Project = require('../model/projects.model');
const Casefolder = require('../model/casefolder.model');
const Imageoperation = require('../model/imageoperation.model');
const Savemedia = require('../model/savemedia.model');
const Operationhistory = require('../model/operationhistory.model');
const Jobprojects = require('../model/imageoperation.model');
const projectService = require("../services/project.service");


const outputRoot = path.join(__dirname, '../public/backups');
const outputDir = path.join(__dirname, '../public/backups');
const outputZipPath = path.join(outputDir, 'combined_backup.zip');
const timestamp = Date.now();//dayjs().format('YYYYMMDD_HHmmss');

// Helper: Run shell command (promisified)
const runCommand = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
};

const zipBackup = async (backupFolder) => {
  const zipFilePath = path.join(outputRoot, `backup_${timestamp}.zip`);
  const output = fs.createWriteStream(zipFilePath);

  const password = 'secure123';

  // const zip = new Zip();
  // await zip.addFolder(backupFolder);  // Adds the entire folder
  // await zip.archive(zipFilePath, { password }); // Archive with password


  // await new Zip()
  // .addFolder(backupFolder)
  // .archive(zipFilePath, { password });

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(output);
  archive.directory(backupFolder, false);

  await new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`✅ ZIP created: ${zipFilePath}`);
      resolve();
    });
    archive.on('error', reject);
    archive.finalize();
  });
};

// Backup project-related data into JSON file inside a folder
const backupMongoDB = async (projectId, folderPath) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const casefolderInbox = await Casefolder.findById(project.catId);
    const imageOperation = await Imageoperation.find({ projectId: projectId });
    const savemedia = await Savemedia.find({ projectId: projectId });
    const operationhistory = await Operationhistory.find({ projectId: projectId });
    const jobprojects = await Jobprojects.find({ projectId: projectId });

    const enrichedData = {
      project,
      casefolderInbox,
      imageOperation,
      savemedia,
      operationhistory,
      jobprojects
    };

    const jsonPath = path.join(folderPath, 'project_export.json');
    await fs.writeJson(jsonPath, enrichedData, { spaces: 2 });
    // console.log(`✅ Project JSON exported to: ${jsonPath}`);
    return jsonPath;
  } catch (error) {
    // throw error;
    return {
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    };
  }
};

const generatepemfiles = async () => {
  // Generate RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key size in bits
    publicKeyEncoding: {
      type: 'pkcs1', // "spki" is also valid
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1', // "pkcs8" is also valid
      format: 'pem'
    }
  });

  // Save to files
  fs.writeFileSync(path.join(__dirname, 'public.pem'), publicKey);
  fs.writeFileSync(path.join(__dirname, 'private.pem'), privateKey);

  console.log('✅ RSA key pair generated (public.pem and private.pem)');
}

// Copy media and DB to folder, rar it, and delete the original
const runBackupProcess = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ status: 'Failed', message: 'Project ID is required.' });
    }
    await fs.remove(outputRoot);
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ status: 'Failed', message: 'Project not found.' });
    }


    const backupFolder = path.join(outputRoot, `backup_${timestamp}`);
    await fs.ensureDir(backupFolder);


    // Export project DB data to JSON
    await backupMongoDB(id, backupFolder);


    // Copy media folder
    const mediaFolder = path.join(process.env.MEDIA_BASE_PATH, req.user.id, id);
    const mediaDest = path.join(backupFolder, 'project_media');
    console.log(`✅ Media copied to ${mediaDest}`);
    await fs.copy(mediaFolder, `public/backups/backup_${timestamp}/project_media`);
    //  await fs.copy(`${mediaFolder}`, `${mediaDest}`, (err) => {
    //         if (err) {
    //             console.log('Error copying the file:', err);
    //         } else {
    //             console.log('Snap File copied successfully.');
    //         }
    //     });

    // console.log(`✅ Media copied to ${mediaDest}`);


    // Create RAR
    // const rarFilePath = path.join(outputRoot, `backup_${timestamp}.rar`);
    // const rarCmd = `rar a -r "${rarFilePath}" "${backupFolder}"`;
    // await runCommand(rarCmd);
    // console.log(`✅ RAR created: ${rarFilePath}`);
    await zipBackup(backupFolder);
    // Remove original folder
    // await fs.remove(backupFolder);
    console.log(`🗑️  Temp folder deleted: ${backupFolder}`);

    //   await generatepemfiles();
    const zipFilePath = `public/backups/backup_${timestamp}.zip`
    const encryptedFilePath = `public/backups/backup_${timestamp}.enc`;
    //   // Load your RSA public key (PEM format)
    //   const publicKey = fs.readFileSync(path.join(__dirname, 'public.pem'), 'utf8');

    //   // Read the zip file content
    //   const zipBuffer = fs.readFileSync(zipFilePath);

    //   // RSA encrypt the ZIP content
    //   const encryptedBuffer = crypto.publicEncrypt(
    //     {
    //       key: publicKey,
    //       padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    //     },
    //     zipBuffer
    //   );

    // AES configuration
    const password = 'secure123'; // You can make this dynamic or store safely
    const key = crypto.createHash('sha256').update(password).digest(); // 32 bytes key
    const iv = crypto.randomBytes(16); // Initialization Vector

    // Encrypt ZIP file
    const input = fs.createReadStream(zipFilePath);
    const output = fs.createWriteStream(encryptedFilePath);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    output.write(iv); // Save IV at beginning of file

    input.pipe(cipher).pipe(output);

    output.on('finish', async () => {
      console.log(`✅ AES Encrypted ZIP saved at: ${encryptedFilePath}`);
      // const fnsFilePath = encryptedFilePath.replace(/\.enc$/, '.vnf');
      //   await fs.rename(zipFilePath, fnsFilePath);
      const encPath = `public/backups/backup_${timestamp}.enc`;
      const vnfPath = encPath.replace('.enc', '.vnf');

      fs.renameSync(encPath, vnfPath);
      // await fs.copyFile(zipFilePath, fnsFilePath);
    });

    // // Save encrypted output
    // const rsaFilePath = path.join(outputRoot, `backup_${timestamp}.rsa`);
    // fs.writeFileSync(rsaFilePath, encryptedBuffer);
    // console.log(`🔐 RSA Encrypted ZIP saved as: ${rsaFilePath}`);




    return res.status(200).json({
      statusCode: 200,
      status: 'Success',
      message: 'Backup and Zip completed successfully.',
      filePath: `backups/backup_${timestamp}.vnf`
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    });
  }
};



const uploadZipFile = async (req, res) => {


  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, 'public/uploads/zips'),
      filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    }),
    // fileFilter: (req, file, cb) => {
    //   // const isZip = file.mimetype === 'application/zip' || path.extname(file.originalname).toLowerCase() === '.zip';
    //   const isZip = file.mimetype === 'application/vnf' || path.extname(file.originalname).toLowerCase() === '.vnf';
    //   cb(isZip ? null : new Error('Only .vnf files are allowed'), isZip);
    // }
  }).single('zipfile');

  upload(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ status: 'Failed', message: err.message });
      }

      const userId = req.user?.id || 'default_user';
      const result = await extractAndRestore(req, req.file.path, userId);

      // res.status(200).json({
      //   status: 'Success',
      //   message: result.message,
      //   projectId: result.projectId
      // });
      // console.log(result);
      res.status(200).json(result);

    } catch (error) {
      // console.error('Restore error:', error);
      res.status(500).json({
        statusCode: 500,
        status: 'Failed',
        message: error.message || 'Internal Server Error',
      });
    }

  });




};

const extractAndRestore = async (req, fnsFilePath, userId) => {
  try {
    const tempExtractPath = path.join(__dirname, '../temp/unzipped');
    await fs.remove(tempExtractPath);

    // 1. Check and rename .fns to .zip
    // const zipFilePath = fnsFilePath.replace(/\.vnf$/, '.enc');
    // await fs.rename(fnsFilePath, zipFilePath);
    console.log('✅ File renamed to .zip:', fnsFilePath);
    const encryptedFilePath = fnsFilePath
    // const encryptedFilePath = 'public/backups/backup_1762427935495.enc';
    //  const encryptedFilePath = fnsFilePath.replace(/\.vnf$/, '.enc');
    //   // await fs.rename(fnsFilePath, encryptedFilePath);
    //   await fs.copyFile(fnsFilePath, encryptedFilePath);
    const decryptedFilePath = `public/backups/decrypted_${timestamp}.zip`;

    const password = 'secure123';
    // const encryptedData = fs.readFileSync(encryptedFilePath);

    // const key = crypto.createHash("sha256").update(password).digest();

    // const iv = encryptedData.slice(0, 16);               // first 16 bytes = IV
    // const encryptedContent = encryptedData.slice(16);    // the rest = ciphertext

    // const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    // const decrypted = Buffer.concat([
    //   decipher.update(encryptedContent),
    //   decipher.final()
    // ]);
    // fs.writeFileSync(decryptedFilePath, decrypted);
    // console.log("Decrypted:", decryptedFilePath);
    // //  console.log('✅ File renamed to .zip:', output.path);
    // await fs.ensureDir(tempExtractPath);
    // // 1. Extract the ZIP
    // await fs.createReadStream(decryptedFilePath)
    //   .pipe(unzipper.Extract({ path: tempExtractPath }))
    //   .promise();


    // console.log('✅ ZIP extracted to:', tempExtractPath);

    await decryptFile(encryptedFilePath, decryptedFilePath, password);

    await fs.ensureDir(tempExtractPath);

    console.log("✔ Starting unzip...");

    // await fs.createReadStream(decryptedFilePath)
    //   .pipe(unzipper.Extract({ path: tempExtractPath }))
    //   .promise();

    const stat = await fs.promises.stat(decryptedFilePath);

// if (stat.size < 200) {
//   throw new Error("❌ Decrypted ZIP is too small — corrupted file");
// }

      await unzipFile(decryptedFilePath, tempExtractPath);

    console.log("✔ ZIP extracted:", tempExtractPath);

    // 2. Move media images to your images folder
    // const extractedImagesPath = path.join(tempExtractPath, 'project_media');
    // const imagesTargetPath = path.join(process.env.MEDIA_BASE_PATH, userId, 'restored_images');
    // await fs.ensureDir(imagesTargetPath);
    // await fs.copy(extractedImagesPath, imagesTargetPath);
    // console.log('✅ Images copied to:', imagesTargetPath);

    // 3. Read and parse JSON
    const jsonPath = path.join(tempExtractPath, 'project_export.json');
    const jsonData = await fs.readJson(jsonPath);

    // 4. Restore data to MongoDB
    // const { project, casefolderInbox, imageOperation, savemedia, operationhistory, jobprojects } = jsonData;
    const response = await projectService.exportProject(req, tempExtractPath, jsonData);
    // const restoredProject = await Project.create(project);
    // const restoredCaseFolder = await Casefolder.create(casefolderInbox);
    // await Imageoperation.insertMany(imageOperation || []);
    // await Savemedia.insertMany(savemedia || []);
    // await Operationhistory.insertMany(operationhistory || []);
    // await Jobprojects.insertMany(jobprojects || []);



    // 5. Clean up temp files
    // await fs.remove(tempExtractPath);

    return response

  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to restore backup',
      error: error.message
    };
    // throw new Error('Failed to restore backup: ' + error.message);
  }
};

async function unzipFile(zipPath, extractPath) {
  console.log("Extracting...");

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }));

    stream.on("close", () => {
      console.log("✔ Unzip completed");
      resolve();
    });

    stream.on("error", (err) => {
      console.log("❌ Unzip error:", err);
      reject(err);
    });
  });
}


const decryptFile = async (encryptedFilePath, decryptedFilePath, password) => {
  const key = crypto.createHash("sha256").update(password).digest();

  // Read full encrypted file
  const encryptedData = await fs.promises.readFile(encryptedFilePath);

  const iv = encryptedData.slice(0, 16);
  const encryptedContent = encryptedData.slice(16);

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

  let decrypted;
  try {
    decrypted = Buffer.concat([
      decipher.update(encryptedContent),
      decipher.final()
    ]);
  } catch (err) {
    console.log("❌ AES Decrypt Error:", err);
    throw err;
  }

  // Full write ensures OS flush is completed
  await fs.promises.writeFile(decryptedFilePath, decrypted);

  console.log("✔ Decryption completed:", decryptedFilePath);
  return decryptedFilePath;
};





const saveAllMideaZip = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ status: 'Failed', message: 'Project ID is required.' });
    }
    // await fs.remove(outputRoot);
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ status: 'Failed', message: 'Project not found.' });
    }
    const mediaSnapFolder = path.join(process.env.MEDIA_BASE_PATH, req.user.id, project.id, 'snap');
    const zipFileName = `${project.projectName || 'project'}_${timestamp}.zip`;
    const zipFilePath = path.join(__dirname, '../public/backups', zipFileName);

    await fs.ensureDir(path.dirname(zipFilePath)); // Make sure output dir exists

    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(mediaSnapFolder, false);

    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ ZIP created: ${zipFilePath}`);
        resolve();
      });
      archive.on('error', reject);
      archive.finalize();
    });

    return res.status(200).json({
      statusCode: 200,
      status: 'Success',
      message: 'Snap folder backup completed successfully.',
      filePath: `backups/${zipFileName}`,
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      status: 'Failed',
      message: error.message || 'Internal Server Error',
    });
  }
};



module.exports = {
  runBackupProcess,
  uploadZipFile,
  saveAllMideaZip
};
