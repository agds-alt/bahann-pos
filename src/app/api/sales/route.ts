import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infra/container';
import { DailySaleInputSchema } from '@/shared/utils/validation';
import { AppError } from '@/shared/exceptions/AppError';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DailySaleInputSchema.parse(body);

    const useCase = container.saleUseCase();
    await useCase.execute(validated);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('[SALES_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
