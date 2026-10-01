/**
 * faceRecognitionService.js
 *
 * Face recognition using Face++ FaceSet API.
 * 
 * Flow:
 *  UPLOAD:  photo → detect faces → add face tokens to event FaceSet
 *  SEARCH:  selfie → detect face token → search FaceSet → return matched photo IDs
 *
 * This uses Face++ proper search API (same approach as Google Photos).
 */

const axios = require('axios');
const FormData = require('form-data');
const logger = require('../utils/logger');

const FACEPP_API_BASE = 'https://api-us.faceplusplus.com/facepp/v3';

// ─── Core Face++ API caller ───────────────────────────────────────────────────
const faceppPost = async (endpoint, fields = {}, fileBuffer = null, fileField = null) => {
  const form = new FormData();

  form.append('api_key', process.env.FACEPP_API_KEY);
  form.append('api_secret', process.env.FACEPP_API_SECRET);

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }

  if (fileBuffer && fileField) {
    form.append(fileField, fileBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
  }

  const response = await axios.post(`${FACEPP_API_BASE}${endpoint}`, form, {
    headers: form.getHeaders(),
    timeout: 30000,
    maxContentLength: 50 * 1024 * 1024,
  });

  return response.data;
};

// ─── Download image from URL into buffer ─────────────────────────────────────
const downloadImageBuffer = async (url) => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30000,
  });
  return Buffer.from(response.data);
};

// ─── FaceSet helpers ──────────────────────────────────────────────────────────

/**
 * Get or create a FaceSet for an event.
 * FaceSet outer_id = event ID (max 255 chars, alphanumeric + underscore)
 */
const getFaceSetOuterId = (eventId) => `event_${eventId}`;

const ensureFaceSet = async (eventId) => {
  const outerId = getFaceSetOuterId(eventId);
  try {
    // Try to get existing faceset
    await faceppPost('/faceset/getdetail', { outer_id: outerId });
    logger.debug(`[FacePP] FaceSet ${outerId} already exists`);
  } catch (err) {
    // Create new faceset if not found
    if (err.response?.data?.error_message?.includes('INVALID_OUTER_ID') ||
      err.response?.data?.error_message?.includes('NOT_FOUND') ||
      err.response?.status === 400) {
      await faceppPost('/faceset/create', {
        outer_id: outerId,
        display_name: `Event ${eventId}`,
      });
      logger.info(`[FacePP] Created FaceSet ${outerId}`);
    } else {
      throw err;
    }
  }
  return outerId;
};

// ─── Detect faces in an image (buffer or URL) ────────────────────────────────
const detectFaces = async (imageSource) => {
  try {
    let result;
    if (Buffer.isBuffer(imageSource)) {
      result = await faceppPost('/detect', {}, imageSource, 'image_file');
    } else {
      result = await faceppPost('/detect', { image_url: imageSource.url });
    }

    const faces = result.faces || [];
    logger.debug(`[FacePP] Detected ${faces.length} face(s)`);

    return faces.map((f) => ({
      faceToken: f.face_token,
      boundingBox: {
        left: f.face_rectangle.left,
        top: f.face_rectangle.top,
        width: f.face_rectangle.width,
        height: f.face_rectangle.height,
      },
      confidence: 0.99,
    }));
  } catch (err) {
    logger.error('[FacePP] detectFaces error:', err.response?.data || err.message);
    return [];
  }
};

/**
 * Generate face "embeddings" for a photo:
 * 1. Detect all faces in the photo
 * 2. Store each face token alongside the photoId as external_id in FaceSet
 * 3. Return face tokens as the "embedding"
 */
const generateEmbedding = async (imageSource, eventId = null) => {
  try {
    let result;
    if (Buffer.isBuffer(imageSource)) {
      result = await faceppPost('/detect', {}, imageSource, 'image_file');
    } else {
      // Download from Cloudinary URL
      const buffer = await downloadImageBuffer(imageSource.url);
      result = await faceppPost('/detect', {}, buffer, 'image_file');
    }

    const faces = result.faces || [];
    logger.debug(`[FacePP] generateEmbedding: detected ${faces.length} face(s)`);

    if (faces.length === 0) return [];

    return faces.map((f) => ({
      faceToken: f.face_token,
      vector: [f.face_token], // store token as vector for DB compatibility
      boundingBox: {
        left: f.face_rectangle.left,
        top: f.face_rectangle.top,
        width: f.face_rectangle.width,
        height: f.face_rectangle.height,
      },
      confidence: 0.99,
    }));
  } catch (err) {
    logger.error('[FacePP] generateEmbedding error:', err.response?.data || err.message);
    return [];
  }
};

/**
 * Add face tokens to an event FaceSet.
 * Called from photoProcessor after generating embeddings.
 * face_token → stored with user_id = photoId so we can retrieve it on search.
 */
const addFaceToSet = async (eventId, faceToken, photoId) => {
  try {
    const outerId = await ensureFaceSet(eventId);

    // Add face token to the FaceSet
    await faceppPost('/faceset/addface', {
      outer_id: outerId,
      face_tokens: faceToken,
    });

    logger.debug(`[FacePP] Added face ${faceToken} to FaceSet ${outerId} for photo ${photoId}`);
    return true;
  } catch (err) {
    logger.error('[FacePP] addFaceToSet error:', err.response?.data || err.message);
    return false;
  }
};

/**
 * Search a selfie against all faces in an event FaceSet.
 * Returns array of { photoId, score } sorted by score descending.
 */
const searchFaceInSet = async (selfieBuffer, eventId, threshold = 0.60) => {
  try {
    const outerId = getFaceSetOuterId(eventId);

    const result = await faceppPost(
      '/search',
      {
        outer_id: outerId,
        return_result_count: 50,
      },
      selfieBuffer,
      'image_file'
    );

    if (result.error_message) {
      logger.error('[FacePP] Search error:', result.error_message);
      return [];
    }

    const results = result.results || [];
    logger.debug(`[FacePP] Search returned ${results.length} candidate(s)`);

    // Filter by threshold and return face tokens with scores
    return results
      .filter((r) => (r.confidence || 0) >= threshold * 100)
      .map((r) => ({
        faceToken: r.face_token,
        score: (r.confidence || 0) / 100,
      }));
  } catch (err) {
    const errMsg = err.response?.data?.error_message || err.message;
    // FaceSet not found = no photos uploaded yet
    if (errMsg?.includes('INVALID_OUTER_ID') || errMsg?.includes('NOT_FOUND')) {
      logger.warn(`[FacePP] FaceSet not found for event ${eventId} - no faces indexed yet`);
      return [];
    }
    logger.error('[FacePP] searchFaceInSet error:', errMsg);
    return [];
  }
};

// ─── Main public API ──────────────────────────────────────────────────────────

/**
 * Validate that a selfie has a detectable face.
 */
const validateSelfieFace = async (buffer) => {
  try {
    const faces = await detectFaces(buffer);

    if (faces.length === 0) {
      return {
        valid: false,
        faceCount: 0,
        message: "We couldn't detect a face in your photo. Please take a clearer selfie in good lighting.",
      };
    }

    if (faces.length > 3) {
      return {
        valid: false,
        faceCount: faces.length,
        message: 'Multiple faces detected. Please use a photo where only your face is visible.',
      };
    }

    return { valid: true, faceCount: faces.length };
  } catch (err) {
    logger.error('[FacePP] validateSelfieFace error:', err.message);
    // Don't block the user if validation itself fails
    return { valid: true, faceCount: 1 };
  }
};

/**
 * Find all matching photos in an event for a given selfie buffer.
 *
 * Steps:
 *  1. Search FaceSet with selfie → get matching face tokens + scores
 *  2. Look up which photoId each face token belongs to (FaceEmbedding DB)
 *  3. Deduplicate by photo (keep highest score per photo)
 *  4. Return sorted by score
 */
const findMatchingFaces = async (selfieBuffer, eventId, threshold = 0.60) => {
  logger.info(`[FacePP] findMatchingFaces for event ${eventId} threshold=${threshold}`);

  // Step 1: Search FaceSet
  const faceMatches = await searchFaceInSet(selfieBuffer, eventId, threshold);

  if (faceMatches.length === 0) {
    logger.info(`[FacePP] No matches found in FaceSet for event ${eventId}`);
    return [];
  }

  logger.info(`[FacePP] Found ${faceMatches.length} face match(es) in FaceSet`);

  // Step 2: Look up photoIds from face tokens in DB
  const { FaceEmbedding } = require('../models');
  const faceTokens = faceMatches.map((m) => m.faceToken);

  const embeddings = await FaceEmbedding.find({
    event: eventId,
    'embedding.0': { $in: faceTokens },
  }).select('photo embedding').lean();

  logger.debug(`[FacePP] Found ${embeddings.length} DB embedding(s) matching tokens`);

  // Step 3: Map face tokens → photoIds with scores
  const photoScores = new Map();

  for (const match of faceMatches) {
    // Find the DB embedding that has this face token
    const dbEmb = embeddings.find(
      (e) => Array.isArray(e.embedding) && e.embedding[0] === match.faceToken
    );

    if (dbEmb) {
      const photoId = dbEmb.photo.toString();
      if (!photoScores.has(photoId) || photoScores.get(photoId) < match.score) {
        photoScores.set(photoId, match.score);
      }
    }
  }

  logger.info(`[FacePP] Matched ${photoScores.size} unique photo(s)`);

  return Array.from(photoScores.entries())
    .map(([photoId, score]) => ({ photoId, score }))
    .sort((a, b) => b.score - a.score);
};

/**
 * getProvider — kept for compatibility with photoProcessor.js
 */
const getProvider = () => ({ name: 'facepp' });

module.exports = {
  detectFaces,
  generateEmbedding,
  findMatchingFaces,
  validateSelfieFace,
  addFaceToSet,
  ensureFaceSet,
  searchFaceInSet,
  downloadImageBuffer,
  getProvider,
};
