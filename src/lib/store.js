"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApi, postApi, putApi, deleteApi } from '@/actions/api';

const resolveClientBaseUrl = () => {
  if (
    process.env.NEXT_PUBLIC_BASE_URL &&
    process.env.NEXT_PUBLIC_BASE_URL.trim() !== ''
  ) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin.replace(/\/$/, '')}/api`;
  }
  return 'http://localhost:3000/api';
};
const API_REVALIDATE = process.env.NEXT_PUBLIC_API_REVALIDATE || 'https://bct-shop.vercel.app/api/revalidate';
const API_CURRENCY = process.env.NEXT_PUBLIC_API_CURRENCY || 'http://localhost:3000';
export const IMG_URL = process.env.NEXT_PUBLIC_IMG_URL || "http://localhost:3000"

const extractErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (error.details?.error) return error.details.error;
  if (error.details?.message) return error.details.message;
  return error.message || fallback;
};

// API route mapping for models that have different endpoint names
const API_ROUTE_MAP = {
  'top-categories': 'top-categories',
  'categories': 'categories',
  'products': 'products',
  'about': 'about',
  'contacts': 'contacts',
  'news': 'news',
  'partners': 'partners',
  'sertificates': 'sertificates',
  'licenses': 'licenses',
  'vendors-about': 'vendors-about',
  'reviews': 'reviews',
  'official-partner': 'official-partner',
  experiments: 'experiments',
  'company-stats': 'company-stats',
  'select-reviews': 'select-reviews',
  discount: 'discount',
  'select-products': 'select-products',
  'admins': 'admins',
  'currencies': 'currencies',
  'banners': 'banners',
  'backgrounds': 'backgrounds',
  'banner-sorts': 'banner-sorts',
  'top-category-sorts': 'top-category-sorts',
  'category-sorts': 'category-sorts'
};


export const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      authChecked: false, // New flag to track if auth has been checked
      authToken: null,
      resolveBaseUrl: resolveClientBaseUrl,

      // Data state
      data: {},
      loading: false,
      error: null,
      currency: {
        official: 0,
        bct: 0,
        roundedBct: 0,
        lastUpdated: null
      },


      // Current model state (persisted to survive refreshes)
      currentModel: 'top-categories',

      // Initialize auth from localStorage
      initAuth: () => {
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('admin_token');
          const savedUser = localStorage.getItem('admin_user');

          if (savedToken && savedUser) {
            try {
              const user = JSON.parse(savedUser);
              set({
                user,
                isAuthenticated: true,
                authChecked: true,
                authToken: savedToken
              });

              return true; // Return true if authenticated
            } catch (error) {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              set({ authChecked: true, authToken: null });
              return false;
            }
          } else {
            set({ authChecked: true, authToken: null });
            return false;
          }
        }
        set({ authChecked: true, authToken: null });
        return false;
      },

      // Auth actions
      login: async (name, password) => {
        set({ loading: true, error: null });
        try {
          const baseUrl = get().resolveBaseUrl();
          const { data: response } = await postApi(
            'admin/login',
            { name, password },
            { baseUrl }
          );

          const { token, admin } = response;
          set({
            user: admin,
            isAuthenticated: true,
            authChecked: true,
            loading: false,
            authToken: token,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(admin));
          }

          return admin;
        } catch (error) {
          const errorMessage = extractErrorMessage(error, 'Login failed');
          set({
            error: errorMessage,
            loading: false,
            authChecked: true,
            authToken: null,
          });
          throw new Error(errorMessage);
        }
      },
      currencyGet: async (priceUsd = 100) => {
        try {
          const res = await fetch(API_CURRENCY + "/api/currency", {
            cache: "force-cache",
            next: { revalidate: 60 },
          });
          const rawRate = await res.json();
          const rate =
            typeof rawRate === 'number'
              ? rawRate
              : Number(rawRate?.rate ?? rawRate?.value);

          if (!rate || Number.isNaN(rate)) {
            throw new Error('Invalid currency response');
          }

          const markupMultiplier = 1.01;
          let total = priceUsd * rate;
          total = total * markupMultiplier;
          total = Math.round(total / 1000) * 1000;
          const roundedBct = total / priceUsd;
          const bctRate = Number((rate * markupMultiplier).toFixed(4));

          const currencyPayload = {
            official: rate,
            bct: bctRate,
            roundedBct,
            lastUpdated: new Date().toISOString()
          };

          set({ currency: currencyPayload });
          return currencyPayload;
        } catch (error) {
          console.error('Error fetching currency:', error);
          return {
            official: 0,
            bct: 0,
            roundedBct: 0,
            lastUpdated: null
          };
        }
      },

      updateAdmin: async (name, password) => {
        set({ loading: true, error: null });
        try {
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();
          const { data: response } = await putApi(
            'admin/update',
            { name, password },
            { token: authToken, baseUrl }
          );

          const { token: newToken, admin } = response;
          const effectiveToken = newToken || authToken;
          set({
            user: admin,
            isAuthenticated: true,
            loading: false,
            authToken: effectiveToken || null,
          });

          if (typeof window !== 'undefined') {
            if (effectiveToken) {
              localStorage.setItem('admin_token', effectiveToken);
            }
            localStorage.setItem('admin_user', JSON.stringify(admin));
          }

          return admin;
        } catch (error) {
          const errorMessage = extractErrorMessage(error, 'Update failed');
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          authChecked: true,
          data: {}, // Clear all data on logout
          authToken: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      },

      // Set current model (this will be persisted)
      setCurrentModel: (model) => {
        set({ currentModel: model });
      },

      // Get correct API route for model
      getApiRoute: (model) => {
        return API_ROUTE_MAP[model] || model;
      },

      // Check if model is singleton
      isSingletonModel: (model) => {
        const singletonModels = ['about', 'contacts', 'discount', 'official-partner'];
        return singletonModels.includes(model);
      },

      getAuthToken: () => {
        const stateToken = get().authToken;
        if (stateToken) return stateToken;
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('admin_token');
          if (token) {
            set({ authToken: token });
            return token;
          }
        }
        return null;
      },

      // CRUD actions
      fetchData: async (model, params = {}) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const queryParams = { page: 1, limit: 100, ...params };
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await getApi(apiRoute, {
            params: queryParams,
            token: authToken,
            baseUrl,
          });

          set(state => ({
            data: {
              ...state.data,
              [model]: response
            },
            loading: false
          }));

          return response;
        } catch (error) {
          console.error(`Error fetching ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to fetch ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      createItem: async (model, data) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await postApi(apiRoute, data, {
            token: authToken,
            baseUrl,
          });

          try {
            await postApi(API_REVALIDATE, { tag: [`${apiRoute}`] });
          } catch (revalidateError) {
            console.warn('Revalidate failed:', revalidateError);
          }

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
          return response;
        } catch (error) {
          console.error(`Error creating ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to create ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      updateItem: async (model, id, data) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await putApi(
            `${apiRoute}/${id}`,
            data,
            { token: authToken, baseUrl }
          );

          try {
            await postApi(API_REVALIDATE, { tag: [`${apiRoute}`] });
          } catch (revalidateError) {
            console.warn('Revalidate failed:', revalidateError);
          }

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
          return response;
        } catch (error) {
          console.error(`Error updating ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to update ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      deleteItem: async (model, id) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          await deleteApi(`${apiRoute}/${id}`, {
            token: authToken,
            baseUrl,
          });

          try {
            await postApi(API_REVALIDATE, { tag: [`${apiRoute}`] });
          } catch (revalidateError) {
            console.warn('Revalidate failed:', revalidateError);
          }

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
        } catch (error) {
          console.error(`Error deleting ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to delete ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      // Special handling for singleton models (about, contacts)
      fetchSingletonData: async (model) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await getApi(apiRoute, {
            token: authToken,
            baseUrl,
          });

          // Check if response data is meaningful (not just empty object)
          let responseData = response;
          if (responseData && typeof responseData === 'object') {
            // If it's an empty object or only has empty fields, treat as null
            const hasContent = Object.keys(responseData).some(key => {
              const value = responseData[key];
              return value && value !== '' && key !== 'id' && key !== '_id' &&
                key !== 'created_at' && key !== 'updated_at';
            });

            if (!hasContent) {
              responseData = null;
            }
          }

          set(state => ({
            data: {
              ...state.data,
              [model]: responseData
            },
            loading: false
          }));

          return responseData;
        } catch (error) {
          console.error(`Error fetching singleton ${model}:`, error);

          // For singletons, 404 is expected if no data exists yet
          if (error.status === 404) {
            set(state => ({
              data: {
                ...state.data,
                [model]: null
              },
              loading: false,
              error: null // Don't show error for expected 404
            }));
            return null;
          }

          // For other errors, still set null but don't show error to user
          if (error.status >= 500) {
            set(state => ({
              data: {
                ...state.data,
                [model]: null
              },
              loading: false,
              error: null // Don't show server errors for singletons
            }));
            return null;
          }

          const errorMessage = extractErrorMessage(error, `Failed to fetch ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      updateSingletonItem: async (model, data) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await putApi(apiRoute, data, {
            token: authToken,
            baseUrl,
          });

          // Refresh the data
          await get().fetchSingletonData(model);

          set({ loading: false });
          return response;
        } catch (error) {
          console.error(`Error updating singleton ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to update ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      createSingletonItem: async (model, data) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();

          const { data: response } = await postApi(apiRoute, data, {
            token: authToken,
            baseUrl,
          });

          // Refresh the data
          await get().fetchSingletonData(model);

          set({ loading: false });
          return response;
        } catch (error) {
          console.error(`Error creating singleton ${model}:`, error);
          const errorMessage = extractErrorMessage(error, `Failed to create ${model}`);
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      uploadFile: async (file) => {
        set({ loading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('file', file);

          const authToken = get().getAuthToken();
          const baseUrl = get().resolveBaseUrl();
          const uploadUrl = `${baseUrl.replace(/\/$/, '')}/files/upload`;
          const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: authToken
              ? {
                  Authorization: authToken.startsWith('Bearer ')
                    ? authToken
                    : `Bearer ${authToken}`,
                }
              : undefined,
            body: formData,
          });

          if (!response.ok) {
            const errorPayload = await response.json().catch(() => null);
            const message =
              errorPayload?.error ||
              errorPayload?.message ||
              'Failed to upload file';
            throw Object.assign(new Error(message), {
              status: response.status,
              details: errorPayload,
            });
          }

          const data = await response.json();

          set({ loading: false });
          return data;
        } catch (error) {
          const errorMessage = extractErrorMessage(error, 'Failed to upload file');
          set({
            error: errorMessage,
            loading: false
          });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'admin-store', // unique name for localStorage key
      partialize: (state) => ({
        currentModel: state.currentModel // only persist currentModel
      }),
    }
  )
);
