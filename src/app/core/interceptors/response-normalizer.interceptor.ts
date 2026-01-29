import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

const shouldNormalize = (body: unknown): body is Record<string, unknown> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return false;
  }
  const record = body as Record<string, unknown>;
  return 'errors' in record || 'result' in record || 'pagination' in record;
};

const normalizeBody = (body: unknown): unknown => {
  if (!shouldNormalize(body)) {
    return body;
  }
  const record = body as Record<string, unknown>;
  const errors = Array.isArray(record['errors']) ? record['errors'] : [];
  const normalized: Record<string, unknown> = { ...record, errors };
  if ('result' in record && record['result'] === undefined) {
    normalized['result'] = null;
  }
  return normalized;
};

export const responseNormalizerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const normalizedBody = normalizeBody(event.body);
        if (normalizedBody !== event.body) {
          return event.clone({ body: normalizedBody });
        }
      }
      return event;
    })
  );
};
