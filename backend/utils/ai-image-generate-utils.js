import fetch from 'node-fetch';
import { asyncHandler } from './asyncHandler-utils.js';
import { ApiResponse } from './api-Responnse-utils.js';
import { ApiError } from './api-error-utils.js';

const MAX_RETRIES = 2;

const productPrompts = [
  `A high-resolution, studio-quality image of a {product} in the {category} category, designed for ecommerce. There should Not be a reflection of white light on the product. Ensuring a premium look. Making it visually appealing. No watermarks, distractions, or unnecessary elements—just a sleek, professional representation perfect for ecommerce listings with the natural background. In its own style write down name {product} in product professionally`,
];

async function fetchImage(apiUrl) {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return response;
}

const generateAndSaveImage = asyncHandler(async (req, res, next) => {
  // Extract query parameters from the request
  const { product, category } = req.body;

  if (!product || !category) {
    return next(ApiError.validationFailed('Product and Category are required'));
  }

  try {

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {

      const value = {
        prompt: productPrompts[Math.floor(Math.random() * productPrompts.length)]
          .replaceAll('{product}', product)
          .replaceAll('{category}', category),
        seed: Math.floor(Math.random() * 1000000),
        model: 'flux-realism',
        width: 512,
        height: 512,
        nologo: true,
        enhance: true,
        safe: true,
      };

      console.log('-----------------Generating Image-----------------');

      // Construct the API URL
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(value.prompt)}?` +
        `model=${value.model}&seed=${value.seed}&width=${value.width}&height=${value.height}&nologo=${value.nologo}&enhance=${value.enhance}&safe=${value.safe}`;

      console.log('Fetching image from:', apiUrl);

      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}`);
        }
        const response = await fetchImage(apiUrl);
        
        // If successful, stream the image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="${product}-${category}.png"`);
        response.body.pipe(res);
        console.log('Image streamed to client successfully');
        return;
      } 
      catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
      }
    }

    console.log('-----------------Image Process Completed-----------------');
  } 
  catch (error) {
    console.error('Error generating image after retries:', error);
    return next(ApiError.imageNotGenerated('Error Generating image.', error));
  } 
});

export { generateAndSaveImage };
