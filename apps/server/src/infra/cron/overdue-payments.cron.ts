import { container } from 'tsyringe';
import { ProcessOverduePaymentsUseCase } from 'apps/server/src/domain/application/use-cases/finance/process-overdue-payments.use-case';

/**
 * Cron job to process overdue payments daily at 9:00 AM
 * This creates expense records for teacher payments when students are late
 */
export async function startOverduePaymentsCron() {
  // Simple interval-based cron (runs every minute, checks time)
  // In production, use a proper cron library like node-cron
  setInterval(async () => {
    const now = new Date();
    // Run at 9:00 AM
    if (now.getHours() === 9 && now.getMinutes() === 0) {
      console.log('[CRON] Running overdue payments process...');
      try {
        const useCase = container.resolve(ProcessOverduePaymentsUseCase);
        const result = await useCase.execute();
        if (result.isSuccess()) {
          console.log('[CRON] Overdue payments processed successfully:', result.value);
        } else {
          console.error('[CRON] Overdue payments processing failed:', result.error);
        }
      } catch (error) {
        console.error('[CRON] Error in overdue payments cron:', error);
      }
    }
  }, 60000); // Check every minute

  console.log('[CRON] Overdue payments cron job started (runs daily at 9:00 AM)');
}
