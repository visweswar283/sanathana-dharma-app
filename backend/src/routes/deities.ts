import { Router, Request, Response } from 'express';
import { deityRegistry } from '../deities/registry';
import { DeityNotFoundError } from '../utils/errors';

const router = Router();

/** GET /api/deities — all deities (available + upcoming) */
router.get('/', (_req: Request, res: Response) => {
  res.json({ deities: deityRegistry.getAllDeities() });
});

/** GET /api/deities/available — only deities ready to chat */
router.get('/available', (_req: Request, res: Response) => {
  res.json({ deities: deityRegistry.getAvailableDeities() });
});

/** GET /api/deities/:id */
router.get('/:id', (req: Request, res: Response) => {
  const deity = deityRegistry.getDeity(req.params.id);
  if (!deity) throw new DeityNotFoundError(req.params.id);
  res.json({ deity: deity.metadata });
});

export default router;
