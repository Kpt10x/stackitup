import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // To check if we have checked for a token yet
  error: null,
};

// Create context
export const AuthContext = createContext(initialState);

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('userInfo');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: action.payload,
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
      };
    case 'SET_LOADING':
        return {
            ...state,
            isLoading: true,
        };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check local storage for user info on initial load
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      // Here you might want to verify the token with the backend
      // For simplicity, we'll just load the user from local storage
      dispatch({ type: 'USER_LOADED', payload: userInfo });
    } else {
      dispatch({ type: 'AUTH_ERROR' }); // Clears out any stale state
    }
  }, []);

  // Actions
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.response && error.response.data.message ? error.response.data.message : error.message,
      });
    }
  };

  const register = async (username, email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await axios.post('/api/auth/register', { username, email, password });
      dispatch({ type: 'REGISTER_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response && error.response.data.message ? error.response.data.message : error.message,
      });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
