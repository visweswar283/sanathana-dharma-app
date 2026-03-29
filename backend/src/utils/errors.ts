export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DeityNotFoundError extends AppError {
  constructor(deityId: string) {
    super(`Deity '${deityId}' not found`, 404, 'DEITY_NOT_FOUND');
  }
}

export class DeityUnavailableError extends AppError {
  constructor(deityId: string) {
    super(`Deity '${deityId}' is not yet available`, 403, 'DEITY_UNAVAILABLE');
  }
}

export class ConversationNotFoundError extends AppError {
  constructor(conversationId: string) {
    super(`Conversation '${conversationId}' not found`, 404, 'CONVERSATION_NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
