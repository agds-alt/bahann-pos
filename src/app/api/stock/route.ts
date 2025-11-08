import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infra/container';
import { DailyStockInputSchema } from '@/shared/utils/validation';
import { AppError } from '@/shared/exceptions/AppError';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DailyStockInputSchema.parse(body);

    const useCase = container.stockUseCase();
    await useCase.execute(validated);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: 'errors' in error ? error.errors : undefined }, { status: 400 });
    }
    logger.error('Stock API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
