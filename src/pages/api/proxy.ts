
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing URL parameter' });
    }
    
    // Forward the request to the target URL
    const response = await fetch(url);
    
    // Get the response body as a buffer
    let responseBody;
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
      return res.status(response.status).json(responseBody);
    } else {
      // For binary data like video streams
      responseBody = await response.arrayBuffer();
      
      // Set the appropriate content type
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      // Return the response with the same status code
      return res.status(response.status).send(Buffer.from(responseBody));
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from the remote server' });
  }
}
