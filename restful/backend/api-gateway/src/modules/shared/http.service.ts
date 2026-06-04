import { Injectable, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);

  private buildHeaders(authHeader?: string, user?: any): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;
    if (user) {
      if (user.sub)   headers['x-user-id']    = user.sub;
      if (user.role)  headers['x-user-role']  = user.role;
      if (user.email) headers['x-user-email'] = user.email;
    }
    return headers;
  }

  async get(url: string, authHeader?: string, user?: any): Promise<any> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      const response = await fetch(url, { method: 'GET', headers });
      const data = await response.json();
      if (!response.ok) throw new HttpException(data, response.status);
      return data;
    } catch (error) {
      this.logger.error(`GET ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Service unavailable', 503);
    }
  }

  /**
   * Proxy a raw (non-JSON) response — e.g. CSV or PDF — directly to the Express response.
   * Returns true on success, throws HttpException on failure.
   */
  async proxyRaw(url: string, res: Response, authHeader?: string, user?: any): Promise<void> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      // Remove Content-Type so downstream can set its own
      delete headers['Content-Type'];

      const upstream = await fetch(url, { method: 'GET', headers });

      if (!upstream.ok) {
        let errBody: any = { message: 'Export failed' };
        try { errBody = await upstream.json(); } catch {}
        throw new HttpException(errBody, upstream.status);
      }

      // Forward content headers
      const ct  = upstream.headers.get('content-type')  || 'text/csv; charset=utf-8';
      const cd  = upstream.headers.get('content-disposition') || 'attachment; filename="report.csv"';
      const cl  = upstream.headers.get('content-length');

      res.setHeader('Content-Type', ct);
      res.setHeader('Content-Disposition', cd);
      res.setHeader('Cache-Control', 'no-cache');
      if (cl) res.setHeader('Content-Length', cl);

      // Stream body
      const buffer = await upstream.arrayBuffer();
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      this.logger.error(`proxyRaw ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Export service unavailable', 503);
    }
  }

  async post(url: string, body: any, authHeader?: string, user?: any): Promise<any> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      const response = await fetch(url, {
        method: 'POST', headers, body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new HttpException(data, response.status);
      return data;
    } catch (error) {
      this.logger.error(`POST ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Service unavailable', 503);
    }
  }

  async put(url: string, body: any, authHeader?: string, user?: any): Promise<any> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      const response = await fetch(url, {
        method: 'PUT', headers, body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new HttpException(data, response.status);
      return data;
    } catch (error) {
      this.logger.error(`PUT ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Service unavailable', 503);
    }
  }

  async patch(url: string, body?: any, authHeader?: string, user?: any): Promise<any> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      const response = await fetch(url, {
        method: 'PATCH', headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new HttpException(data, response.status);
      return data;
    } catch (error) {
      this.logger.error(`PATCH ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Service unavailable', 503);
    }
  }

  async delete(url: string, authHeader?: string, user?: any): Promise<any> {
    try {
      const headers = this.buildHeaders(authHeader, user);
      const response = await fetch(url, { method: 'DELETE', headers });
      const data = await response.json();
      if (!response.ok) throw new HttpException(data, response.status);
      return data;
    } catch (error) {
      this.logger.error(`DELETE ${url} failed: ${error.message}`);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Service unavailable', 503);
    }
  }
}
