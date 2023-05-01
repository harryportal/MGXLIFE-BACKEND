import sharp from "sharp";

export default async function CompressImage(file:any){
    const compressedBuffer = await sharp(file.path)
      .resize(800) // Optional: resize image if needed
      .png({ compressionLevel: 9 }) // Use PNG format with maximum compression level
      .toBuffer()
    file.Buffer = compressedBuffer;
    return file;
}