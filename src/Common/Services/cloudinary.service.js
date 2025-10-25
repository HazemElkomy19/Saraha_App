import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file,options) => {
    try {
        const result = await cloudinary.uploader.upload(file,options);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

export const uploadManyToCloudinary = async (files,options) => {
   const result = [];
   for(const file of files){
    const uploadResult = await uploadToCloudinary(file,options);
    result.push(uploadResult);
   }
   return result;
};

export const deleteFromCloudinary = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export const deleteManyFromCloudinary = async (public_ids) => {
    try {
        const result = await cloudinary.api.delete_resources(public_ids);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export const cleanUpCloudinary = async (folderPath) => {
    try {
        const result = await cloudinary.api.delete_resources_by_prefix(folderPath);
        return result;
    } catch (error) {
        console.error('Error cleaning up Cloudinary:', error);
        throw error;
    }
};

export const deleteFolderFromCloudinary = async (folderPath) => {
    try {
        await cleanUpCloudinary(folderPath);
        const result = await cloudinary.api.delete_folder(folderPath);
        return result;
    } catch (error) {
        console.error('Error deleting folder from Cloudinary:', error);
        throw error;
    }
};