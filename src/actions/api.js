'use server';

const resolveDefaultBaseUrl = () => {
  if (process.env.API_BASE_URL && process.env.API_BASE_URL.trim() !== '') {
    return process.env.API_BASE_URL;
  }
  if (
    process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NEXT_PUBLIC_BASE_URL.trim() !== ''
  ) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}/api`;
  }
  // Fallback to port 9000 API server
  return 'http://localhost:9000/api';
};

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000/api"

const normalizePath = (path) => {
  if (!path) {
    throw new Error('apiRequest requires a non-empty path');
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const trimmedBase = DEFAULT_BASE_URL.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
};

const appendQueryParameters = (url, params = {}) => {
  const urlInstance = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => urlInstance.searchParams.append(key, String(item)));
    } else {
      urlInstance.searchParams.set(key, String(value));
    }
  });
  return urlInstance;
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  if (contentType && contentType.includes('text/')) {
    return response.text();
  }
  // Fallback to ArrayBuffer for unknown content types
  return response.arrayBuffer();
};

export async function apiRequest({
  path,
  method = 'GET',
  data,
  params,
  token,
  headers = {},
  cache = 'no-store',
  next,
  revalidate,
  baseUrl,
} = {}) {
  const targetUrl = normalizePath(
    baseUrl ? `${baseUrl}/${path.replace(/^\/+/, '')}` : path
  );
  const urlWithParams = appendQueryParameters(targetUrl, params);

  const fetchHeaders = new Headers({
    Accept: 'application/json, text/plain, */*',
    ...headers,
  });

  let body = undefined;

  if (token) {
    fetchHeaders.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
  }

  if (data !== undefined && data !== null) {
    if (data instanceof FormData) {
      body = data;
      fetchHeaders.delete('Content-Type'); // Allow fetch to set boundary
    } else if (
      typeof data === 'object' &&
      !(data instanceof ArrayBuffer) &&
      !(data instanceof Blob)
    ) {
      body = JSON.stringify(data);
      if (!fetchHeaders.has('Content-Type')) {
        fetchHeaders.set('Content-Type', 'application/json');
      }
    } else {
      body = data;
    }
  }

  const fetchOptions = {
    method,
    headers: fetchHeaders,
    cache,
    body,
  };

  if (revalidate !== undefined || next) {
    fetchOptions.next = {
      revalidate,
      ...(next || {}),
    };
  }

  const response = await fetch(urlWithParams, fetchOptions);
  const payload = await parseResponseBody(response).catch(() => null);
  console.log({ response, payload, body })
  if (!response.ok) {
    const error = new Error(
      payload?.message ||
      payload?.error ||
      `Request to ${urlWithParams.pathname} failed with status ${response.status}`
    );
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return {
    data: payload,
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    url: urlWithParams.toString(),
  };
}

export async function getApi(path, options = {}) {
  return apiRequest({ ...options, method: 'GET', path });
}

export async function postApi(path, data, options = {}) {
  return apiRequest({ ...options, method: 'POST', path, data });
}

export async function putApi(path, data, options = {}) {
  return apiRequest({ ...options, method: 'PUT', path, data });
}

export async function deleteApi(path, options = {}) {
  return apiRequest({ ...options, method: 'DELETE', path });
}
