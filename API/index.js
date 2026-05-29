/**
 * API/index.js
 * Central API Client configuration and request helpers.
 */

// Global base URL for your backend API services
export const BASE_URL = 'https://api.vibecheck.com'; 

// Shared base request handler supporting JSON payloads and structured error forwarding
const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || 'Something went wrong',
        data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw {
      status: 0,
      message: error.message || 'Network error occurred',
    };
  }
};

export const api = {
  get: (endpoint, headers) => 
    request(endpoint, { method: 'GET', headers }),
    
  post: (endpoint, body, headers) => 
    request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
    
  put: (endpoint, body, headers) => 
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
    
  delete: (endpoint, headers) => 
    request(endpoint, { method: 'DELETE', headers }),
};

export default api;
