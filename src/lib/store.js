import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/api';
const API_REVALIDATE = process.env.NEXT_PUBLIC_API_REVALIDATE || 'https://bct-shop.vercel.app/api/revalidate';
export const IMG_URL = process.env.NEXT_PUBLIC_IMG_URL || "http://localhost:3000"

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

      // Data state
      data: {},
      loading: false,
      error: null,

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
                authChecked: true
              });

              // Set authorization header for future requests
              axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
              return true; // Return true if authenticated
            } catch (error) {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              set({ authChecked: true });
              return false;
            }
          } else {
            set({ authChecked: true });
            return false;
          }
        }
        set({ authChecked: true });
        return false;
      },

      // Auth actions
      login: async (name, password) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post(`${API_BASE_URL}/admin/login`, {
            name,
            password
          });

          const { token, admin } = response.data;
          set({
            user: admin,
            isAuthenticated: true,
            authChecked: true,
            loading: false
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(admin));
          }

          // Set default authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return admin;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({
            error: errorMessage,
            loading: false,
            authChecked: true
          });
          throw new Error(errorMessage);
        }
      },

      updateAdmin: async (name, password) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put(`${API_BASE_URL}/admin/update`, {
            name,
            password
          });

          const { token, admin } = response.data;
          set({
            user: admin,
            isAuthenticated: true,
            loading: false
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(admin));
          }

          // Update authorization header with new token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return admin;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Update failed';
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
          data: {} // Clear all data on logout
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];
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

      // CRUD actions
      fetchData: async (model, params = {}) => {
        set({ loading: true, error: null });
        try {
          const apiRoute = get().getApiRoute(model);
          const queryParams = new URLSearchParams(params).toString();
          const url = `${API_BASE_URL}/${apiRoute}${queryParams ? `?${queryParams}` : '?page=1&limit=20'}`;
          console.log(`Fetching data from: ${url}`); // Debug log

          const response = await axios.get(url);
          set(state => ({
            data: {
              ...state.data,
              [model]: response.data
            },
            loading: false
          }));

          return response.data;
        } catch (error) {
          console.error(`Error fetching ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to fetch ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}`;

          console.log(`Creating item at: ${url}`, data); // Debug log

          const response = await axios.post(url, data);
          const revalidate = await axios.post(API_REVALIDATE, {
            tag: [
              `${apiRoute}`
            ]
          });
          console.log({ revalidate })

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error(`Error creating ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to create ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}/${id}`;

          console.log(`Updating item at: ${url}`, data); // Debug log

          const response = await axios.put(url, data);
          const revalidate = await axios.post(API_REVALIDATE, {
            tag: [
              `${apiRoute}`
            ]
          });
          console.log({ revalidate })

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error(`Error updating ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to update ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}/${id}`;

          console.log(`Deleting item at: ${url}`); // Debug log

          await axios.delete(url);
          const revalidate = await axios.post(API_REVALIDATE, {
            tag: [
              `${apiRoute}`
            ]
          });
          console.log({ revalidate })

          // Refresh the data
          if (get().isSingletonModel(model)) {
            await get().fetchSingletonData(model);
          } else {
            await get().fetchData(model);
          }

          set({ loading: false });
        } catch (error) {
          console.error(`Error deleting ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to delete ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}`;

          console.log(`Fetching singleton data from: ${url}`); // Debug log

          const response = await axios.get(url);

          // Check if response data is meaningful (not just empty object)
          let responseData = response.data;
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
          console.error(`Error fetching singleton ${model}:`, error.response?.data || error.message);

          // For singletons, 404 is expected if no data exists yet
          if (error.response?.status === 404) {
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
          if (error.response?.status >= 500) {
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

          const errorMessage = error.response?.data?.error || `Failed to fetch ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}`;

          console.log(`Updating singleton at: ${url}`, data); // Debug log

          const response = await axios.put(url, data);

          // Refresh the data
          await get().fetchSingletonData(model);

          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error(`Error updating singleton ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to update ${model}`;
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
          const url = `${API_BASE_URL}/${apiRoute}`;

          console.log(`Creating singleton at: ${url}`, data); // Debug log

          const response = await axios.post(url, data);

          // Refresh the data
          await get().fetchSingletonData(model);

          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error(`Error creating singleton ${model}:`, error.response?.data || error.message);
          const errorMessage = error.response?.data?.error || `Failed to create ${model}`;
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

          const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          set({ loading: false });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Failed to upload file';
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