import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 100 * 1024; // 100KB in bytes

async function optimizeImage(inputBuffer) {
    // Convert to JPG format first
    let processedBuffer = await sharp(inputBuffer)
        .jpeg({
            quality: 90,
            chromaSubsampling: '4:4:4'
        })
        .toBuffer();

    // Check if the image is already under MAX_FILE_SIZE
    if (processedBuffer.length <= MAX_FILE_SIZE) {
        return processedBuffer;
    }

    let quality = 90;
    let width = (await sharp(processedBuffer).metadata()).width;

    // Progressively reduce quality and size until file is under MAX_FILE_SIZE
    while (processedBuffer.length > MAX_FILE_SIZE && (quality > 10 || width > 200)) {
        if (quality > 10) {
            quality -= 10;
            processedBuffer = await sharp(inputBuffer)
                .jpeg({ quality })
                .toBuffer();
        } else {
            width = Math.round(width * 0.9); // Reduce width by 10%
            processedBuffer = await sharp(inputBuffer)
                .resize(width, null, { 
                    withoutEnlargement: true,
                    fit: 'contain'
                })
                .jpeg({ quality: 70 })
                .toBuffer();
        }
    }

    return processedBuffer;
}


// Test function to try the optimizer
async function testImageOptimizer(inputPath) {
    try {
        // Read the input file
        const inputBuffer = await fs.readFile(inputPath);
        
        // Get original file size
        const originalSize = inputBuffer.length;
        console.log(`Original image size: ${(originalSize / 1024).toFixed(2)}KB`);
        
        // Optimize the image
        const optimizedBuffer = await optimizeImage(inputBuffer);
        
        // Create output filename
        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(
            parsedPath.dir, 
            `${parsedPath.name}_optimized${parsedPath.ext}`
        );
        
        // Save the optimized image
        await fs.writeFile(outputPath, optimizedBuffer);
        
        console.log(`Optimized image size: ${(optimizedBuffer.length / 1024).toFixed(2)}KB`);
        console.log(`Saved optimized image to: ${outputPath}`);
        
        return outputPath;
    } catch (error) {
        console.error('Error during image optimization:', error);
        throw error;
    }
}

// Example usage (uncomment to test):
// testImageOptimizer('./utils/test-img.jpeg')
//     .then(outputPath => console.log('Success!'))
//     .catch(error => console.error('Failed:', error));

export { optimizeImage, testImageOptimizer };
