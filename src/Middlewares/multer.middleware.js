import multer from "multer";
import { allowedFileExtensions, fileTypes } from "../Common/constants/file.constants.js";
import fs from "node:fs"

function createFolderIfNotExists(folderPath){
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath , {recursive:true});
    }
}

export const localUpload = ({
    folderPath="samples",
    limits={}
})=>{
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const fileDir = 'uploads/'+folderPath;
            createFolderIfNotExists(fileDir);
            cb(null, fileDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    });

    const fileFilter = (req, file, cb) => {
        // if (allowedFileExtensions[fileTypes.IMAGE].includes(file.mimetype.split('/')[1])) {
        //     cb(null, true);
        // } else {
        //     cb(null, false);
        // }
        const fileKey = file.mimetype.split('/')[0].toUpperCase();
        const fileType = fileTypes[fileKey];
        console.log({fileType});
        
        // const fileExtension = file.mimetype.split('/')[1];
        if (!fileType){
            return cb(new Error("Invalid file type"),false);

        }
        const fileExtension = file.mimetype.split('/')[1];
        console.log({fileExtension , extensions:allowedFileExtensions[fileType]});
        
        if(allowedFileExtensions[fileType].includes(fileExtension)){
            cb(null,true);
        }else{
            cb(new Error("Invalid file extension"),false);
        }
    }
    return multer({limits,fileFilter,storage});
}

export const cloudinaryUpload = ({
    limits={}
})=>{
    const storage = multer.diskStorage({});

    const fileFilter = (req, file, cb) => {
        // if (allowedFileExtensions[fileTypes.IMAGE].includes(file.mimetype.split('/')[1])) {
        //     cb(null, true);
        // } else {
        //     cb(null, false);
        // }
        const fileKey = file.mimetype.split('/')[0].toUpperCase();
        const fileType = fileTypes[fileKey];
        console.log({fileType});
        
        // const fileExtension = file.mimetype.split('/')[1];
        if (!fileType){
            return cb(new Error("Invalid file type"),false);

        }
        const fileExtension = file.mimetype.split('/')[1];
        console.log({fileExtension , extensions:allowedFileExtensions[fileType]});
        
        if(allowedFileExtensions[fileType].includes(fileExtension)){
            cb(null,true);
        }else{
            cb(new Error("Invalid file extension"),false);
        }
    }
    return multer({limits,fileFilter,storage});
}