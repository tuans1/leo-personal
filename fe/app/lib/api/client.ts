/**
 * Base API client: base URL from env, typed fetch, error parsing.
 * Used by S3 and other REST endpoints calling the backend.
 */

const DEFAULT_API_URL = "http://localhost:4000";

/** Backend error response shape (NestJS default). */
export interface ApiErrorBody {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: ApiErrorBody
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function buildUrl(path: string, query?: Record<string, string>): string {
  const base = getBaseUrl().replace(/\/$/, "");
  const pathNorm = path.startsWith("/") ? path : `/${path}`;
  let url = `${base}${pathNorm}`;
  if (query && Object.keys(query).length > 0) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }
  return url;
}

async function parseErrorResponse(response: Response): Promise<ApiErrorBody | null> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      const data = await response.json();
      if (data && typeof data.message !== "undefined") {
        return data as ApiErrorBody;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string | FormData;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

/**
 * Typed request helper. Parses JSON when response is OK and content-type is JSON.
 * Throws ApiClientError when !response.ok, with message from backend body when available.
 */
export async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const { method = "GET", body, headers = {}, query } = options ?? {};
  const url = buildUrl(path, query);

  const isFormData = body instanceof FormData;
  const requestHeaders: Record<string, string> = { ...headers };
  if (!isFormData && body !== undefined && typeof body === "string") {
    requestHeaders["Content-Type"] = "application/json";
  }
  // Do not set Content-Type for FormData — browser sets boundary

  const response = await fetch(url, {
    method,
    headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
    body,
  });

  if (!response.ok) {
    const errorBody = await parseErrorResponse(response);
    const message =
      errorBody?.message != null
        ? Array.isArray(errorBody.message)
          ? errorBody.message.join(", ")
          : errorBody.message
        : response.statusText || `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, errorBody ?? undefined);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}

/**
 * Upload with FormData. Does not set Content-Type so browser sets multipart boundary.
 * Returns parsed JSON response.
 */
export async function multipartFormData<T>(path: string, formData: FormData, query?: Record<string, string>): Promise<T> {
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    // No Content-Type header — fetch will set multipart/form-data; boundary=...
  });

  if (!response.ok) {
    const errorBody = await parseErrorResponse(response);
    const message =
      errorBody?.message != null
        ? Array.isArray(errorBody.message)
          ? errorBody.message.join(", ")
          : errorBody.message
        : response.statusText || `Upload failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, errorBody ?? undefined);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}
