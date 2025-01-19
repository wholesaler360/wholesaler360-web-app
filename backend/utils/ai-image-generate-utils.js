import fs from 'fs';
import fetch from 'node-fetch';
import { asyncHandler } from './asyncHandler-utils.js';
import { ApiResponse } from './api-Responnse-utils.js';
import { ApiError } from './api-error-utils.js';

// Product prompts for generating images
const productPrompts = [
  `A high-quality image of a product {product} in the {category} category for the ecommerce`,
];

const generateAndSaveImage = asyncHandler(async (req, res ,next) => {
  
  // Extract query parameters from the request
  
  const {product,category} = req.body;
  // const product = "weighing scale";
  // const category = "industry";
  
  if(!product || !category){
    return next(ApiError.validationFailed("Product and Category are required"));
  }
  
  const value = {
    prompt : productPrompts[Math.floor(Math.random() * productPrompts.length)].replace('{product}', product).replace('{category}', category),
    seed: Math.floor(Math.random() * 1000000),
    model : 'flux',
    width : 512,
    height : 512,
    nologo : true,
    enhance : false,
    safe : true,
  } ;
  
  try {
    console.log("-----------------Generating Image-----------------");
    // Construct the API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(value.prompt)}?` +
      `model=${value.model}&seed=${value.seed}&width=${value.width}&height=${value.height}&nologo=${value.nologo}&enhance=${value.enhance}&safe=${value.safe}`;

    console.log('Fetching image from:', apiUrl);

    // Fetch the image from the API
    const response = await fetch(apiUrl);

    if (!response.status.toString().startsWith('2')) {
      return next(ApiError.imageNotGenerated("Image not generated",errorText));
      const errorText = await response.text();
      throw new Error(`Failed to fetch image: ${response.statusText}\nServer Response: ${errorText}`);
    }

    // Read the response as a buffer
    const buffer = await response.buffer();

    // Save the image to the file system
    const imageName = `${product}-${category}-${Date.now()}`;
    const outputPath = `./public/temp/${imageName}.png`;

    if(fs.existsSync(outputPath)){
      fs.unlinkSync(outputPath);
    }


    // Ensure the directory exists
    const dirPath = outputPath.substring(0, outputPath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save the image to the file system
    fs.writeFileSync(outputPath, buffer);

    console.log('Image saved successfully:', outputPath);
    
    // Respond with the image path
    const publicUrl = `${req.protocol}://${req.get('host')}/public/temp/${imageName}.png`;
    
    res.status(201).json(ApiResponse.successCreated({ imagePath: publicUrl }, 'Image generated successfully'));
    
    // Delete thr image after response is send
    // fs.unlinkSync(outputPath);
  } catch (error) {
    console.error('Error generating image:', error);
    return next(ApiError.imageNotGenerated("Image not generated",error));

  }finally {
    if(fs.existsSync(outputPath)){
      setTimeout(() => {
        fs.unlinkSync(outputPath);
      }, 60000);
    }
    console.log("-----------------Image Generated-----------------");
  }
});

export { generateAndSaveImage };