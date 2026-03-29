import { Router, Response } from 'express';
import { conversationStore } from '../services/conversation/ConversationStore';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

/** GET /api/conversations — user's conversation history */
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const conversations = conversationStore.getByUser(req.userId!).map((c) => ({
    id: c.id,
    deityId: c.deityId,
    startedAt: c.startedAt,
    lastMessageAt: c.lastMessageAt,
    messageCount: c.messages.length,
    lastMessage: c.messages.at(-1)?.content.slice(0, 80) ?? '',
  }));
  res.json({ conversations });
});

/** GET /api/conversations/:id — single conversation with messages */
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const conversation = conversationStore.get(req.params.id);
  if (conversation.userId !== req.userId) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    return;
  }
  res.json({ conversation });
});

export default router;
