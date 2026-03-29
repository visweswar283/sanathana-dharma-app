import { Router, Response } from 'express';
import { chatService } from '../services/chat/ChatService';
import { chatRateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { authenticate, AuthRequest } from '../middleware/auth';
import { chatRequestSchema } from '../models/schemas';

const router = Router();

/**
 * POST /api/chat/:deityId
 *
 * Streams deity response via Server-Sent Events (SSE).
 *
 * Events:
 *   data: {"type":"chunk","content":"..."}
 *   data: {"type":"done","conversationId":"...","cachedTokens":N,"totalTokens":N}
 *   data: {"type":"error","message":"..."}
 */
router.post(
  '/:deityId',
  authenticate,
  chatRateLimit,
  validate(chatRequestSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { deityId } = req.params;
    const { conversationId, message, emotionalState } = req.body;
    const userId = req.userId!;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    const sendEvent = (data: object): void => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const stream = chatService.streamDeityResponse(
        deityId,
        userId,
        conversationId,
        message,
        emotionalState
      );

      for await (const event of stream) {
        sendEvent(event);
        if (event.type === 'done' || event.type === 'error') break;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      sendEvent({ type: 'error', message });
    } finally {
      res.end();
    }
  }
);

export default router;
