import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../tokens/api-base-url.token';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const apiBaseUrl = inject(API_BASE_URL);
  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = req.url.replace(/^\/+/, '');

  return next(req.clone({ url: `${normalizedBaseUrl}/${normalizedPath}` }));
};
