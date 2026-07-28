import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.Cloudinary_cloud_name,
  api_key: process.env.Cloudinary_Api_key,
  api_secret: process.env.Cloudinary_Api_Secret,
});


const res = await cloudinary.api.ping();
console.log(res);
const uploadoncloudinary = async (
  file: Blob
): Promise<string | null> => {
  if (!file) return null;

  try {
   

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const secureUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Error:", error);
            return reject(error);
          }

          if (!result) {
            return reject(new Error("No result returned from Cloudinary"));
          }

          resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });

    return secureUrl;
  } catch (error) {
    console.error("Upload Failed:", error);
    return null;
  }
};

export default uploadoncloudinary;