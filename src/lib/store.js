import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/api';
export const IMG_URL = process.env.NEXT_PUBLIC_IMG_URL || "http://localhost:3000"

export const useStore = create((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: false,
  
  // Data state
  data: {},
  loading: false,
  error: null,
  
  // Current model state
  currentModel: 'reviews',
  
  // Initialize auth from localStorage
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('admin_token');
      const savedUser = localStorage.getItem('admin_user');
      
      if (savedToken && savedUser) {
        try {
          const user = JSON.parse(savedUser);
          set({ user, isAuthenticated: true });
          
          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (error) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        }
      }
    }
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
        loading: false
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
    set({ user: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  },
  
  // Set current model
  setCurrentModel: (model) => {
    set({ currentModel: model });
  },
  
  // CRUD actions
  fetchData: async (model, params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/${model}${queryParams ? `?${queryParams}` : ''}`;
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
      const errorMessage = error.response?.data?.error || 'Failed to fetch data';
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
      const response = await axios.post(`${API_BASE_URL}/${model}`, data);
      
      // Refresh the data
      await get().fetchData(model);
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create item';
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
      const response = await axios.put(`${API_BASE_URL}/${model}/${id}`, data);
      
      // Refresh the data
      await get().fetchData(model);
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update item';
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
      await axios.delete(`${API_BASE_URL}/${model}/${id}`);
      
      // Refresh the data
      await get().fetchData(model);
      
      set({ loading: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete item';
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
}));