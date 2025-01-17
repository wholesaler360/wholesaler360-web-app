import fs from 'fs';
import fetch from 'node-fetch';
import { asyncHandler } from './asyncHandler-utils.js';

const generateAndSaveImage = asyncHandler(async (req, res) => {
  try {
 
    // Extract query parameters from the request
    const {
      prompt = req.body.prompt,
      model = 'flux',
      seed,
      width = 1024,
      height = 1024,
      nologo = true,
      enhance = false,
      safe = true,
    } = req.query;

    // Validate required parameter
    if (!prompt) {
      return res.status(400).json({ error: 'The "prompt" parameter is required.' });
    }

    // Construct the API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?` +
      `model=${model}&seed=${seed || ''}&width=${width}&height=${height}&nologo=${nologo}&enhance=${enhance}&safe=${safe}`;

    console.log('Fetching image from:', apiUrl);

    // Fetch the image from the API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch image: ${response.statusText}\nServer Response: ${errorText}`);
    }

    // Read the response as a buffer
    const buffer = await response.buffer();

    // Define the output path
    const outputPath = './public/temp/image.png';

    // Ensure the directory exists
    const dirPath = outputPath.substring(0, outputPath.lastIndexOf('/'));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save the image to the file system
    fs.writeFileSync(outputPath, buffer);

    console.log('Image saved successfully:', outputPath);

    // Respond with the image path
    res.status(200).json({ message: 'Image generated successfully.', path: outputPath });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image.', details: error.message });
  }
});

export { generateAndSaveImage };