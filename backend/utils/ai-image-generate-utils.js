import fetch from 'node-fetch';
import { asyncHandler } from './asyncHandler-utils.js';
import { ApiResponse } from './api-Responnse-utils.js';
import { ApiError } from './api-error-utils.js';

// Product prompts for generating images
const productPrompts = [
  `A high-quality image of a product {product} in the {category} category for the ecommerce`,
];

const generateAndSaveImage = asyncHandler(async (req, res, next) => {
  // Extract query parameters from the request
  const { product, category } = req.body;

  if (!product || !category) {
    return next(ApiError.validationFailed('Product and Category are required'));
  }

  const value = {
    prompt: productPrompts[Math.floor(Math.random() * productPrompts.length)]
      .replace('{product}', product)
      .replace('{category}', category),
    seed: Math.floor(Math.random() * 1000000),
    model: 'flux',
    width: 512,
    height: 512,
    nologo: true,
    enhance: false,
    safe: true,
  };

  try {
    console.log('-----------------Generating Image-----------------');

    // Construct the API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(value.prompt)}?` +
      `model=${value.model}&seed=${value.seed}&width=${value.width}&height=${value.height}&nologo=${value.nologo}&enhance=${value.enhance}&safe=${value.safe}`;

    console.log('Fetching image from:', apiUrl);

    // Fetch the image from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return next(ApiError.imageNotGenerated('Failed to fetch image', response.statusText));
      const errorText = await response.text();
      throw new Error(`Failed to fetch image: ${response.statusText}\nServer Response: ${errorText}`);
    }

    // Stream the image directly to the client
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${product}-${category}.png"`);

    // Pipe the image stream to the response 
    response.body.pipe(res);
    console.log('Image streamed to client successfully');
  
  } catch (error) {
    console.error('Error generating image:', error);
    return next(ApiError.imageNotGenerated('Image not generated', error));
  } finally {
    console.log('-----------------Image Process Completed-----------------');
  }
});

export { generateAndSaveImage };
