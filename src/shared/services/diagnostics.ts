export interface DiagnosticContext {
  area: string;
  operation?: string;
  details?: Record<string, unknown>;
}

const reportedWarnings = new Set<string>();

function label(context: DiagnosticContext): string {
  return `[Ritus:${context.area}${context.operation ? `:${context.operation}` : ''}]`;
}

export function reportError(error: unknown, context: DiagnosticContext): void {
  console.error(label(context), error, context.details || {});
}

export function reportWarningOnce(
  warningKey: string,
  error: unknown,
  context: DiagnosticContext,
): void {
  if (reportedWarnings.has(warningKey)) return;
  reportedWarnings.add(warningKey);
  console.warn(label(context), error, context.details || {});
}

export function installGlobalDiagnostics(): () => void {
  const onError = (event: ErrorEvent) => {
    reportError(event.error || event.message, { area: 'window', operation: 'error' });
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportError(event.reason, { area: 'window', operation: 'unhandled-rejection' });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);
  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}
