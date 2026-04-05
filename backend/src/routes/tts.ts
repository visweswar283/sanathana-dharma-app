import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { isTTSAvailable, synthesizeSpeech } from '../services/tts/TTSService';

const router = Router();

/** GET /api/tts/status — lets mobile check if voice mode is available */
router.get('/status', authenticate, (_req, res) => {
  res.json({ available: isTTSAvailable() });
});

/**
 * POST /api/tts
 * Body: { text: string, deityId: string }
 * Returns: { audioBase64: string, mimeType: 'audio/mpeg' }
 */
router.post('/', authenticate, async (req, res) => {
  if (!isTTSAvailable()) {
    res.status(503).json({
      error: { code: 'TTS_UNAVAILABLE', message: 'Voice mode requires an ElevenLabs API key.' },
    });
    return;
  }

  const { text, deityId } = req.body as { text?: string; deityId?: string };

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'text is required' } });
    return;
  }

  if (!deityId || typeof deityId !== 'string') {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'deityId is required' } });
    return;
  }

  const audioBuffer = await synthesizeSpeech(text.trim(), deityId);
  const audioBase64 = audioBuffer.toString('base64');

  res.json({ audioBase64, mimeType: 'audio/mpeg' });
});

export default router;
