import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { supabase } from './supabaseService';
import Constants from 'expo-constants';

// Required for web only but doesn't hurt to have for all platforms
WebBrowser.maybeCompleteAuthSession();

// Use the global __DEV__ variable to determine if we're in development mode
// This is built into React Native and more reliable than checking Constants
const isDevelopment = __DEV__;

// Get the hostname and port dynamically
const getExpoDevelopmentUrl = async () => {
  // Try to get the current URL to determine host and port
  const initialUrl = await Linking.getInitialURL();
  console.log('Initial URL for redirect configuration:', initialUrl);
  
  let host = 'localhost';
  let port = '8081'; // Default to 8081 based on your logs
  
  if (initialUrl) {
    try {
      const url = new URL(initialUrl);
      if (url.hostname) host = url.hostname;
      if (url.port) port = url.port;
    } catch (e) {
      console.log('Error parsing URL:', e);
    }
  }
  
  console.log(`Using host: ${host} and port: ${port} for auth redirect`);
  return { host, port };
};

// Create redirect URIs for different scenarios
const createRedirectUri = async () => {
  if (isDevelopment) {
    // Get dynamic host and port for development
    const { host, port } = await getExpoDevelopmentUrl();
    
    // For Expo development, create a dynamic URI that matches the current environment
    const devRedirect = `exp://${host}:${port}/--/auth-callback`;
    console.log('Using development redirect URI:', devRedirect);
    return devRedirect;
  } else {
    // Production redirect
    const prodRedirect = makeRedirectUri({
      scheme: 'financeglance',
      path: 'auth/callback',
    });
    console.log('Using production redirect URI:', prodRedirect);
    return prodRedirect;
  }
};

// This function extracts session data from the URL after OAuth redirect
const createSessionFromUrl = async (url: string) => {
  try {
    console.log('Creating session from URL:', url);
    
    // Extract the params from the URL
    const { params, errorCode } = QueryParams.getQueryParams(url);
    
    if (errorCode) {
      console.error('Error code in redirect:', errorCode);
      throw new Error(errorCode);
    }
    
    // Get tokens from the URL parameters
    const { access_token, refresh_token } = params;
    
    if (!access_token) {
      console.warn('No access token found in URL');
      return null;
    }
    
    console.log('Setting session with tokens from URL');
    
    // Set the session in Supabase
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    
    if (error) {
      console.error('Error setting session:', error);
      throw error;
    }
    
    console.log('Session successfully created');
    return data.session;
  } catch (error) {
    console.error('Error creating session from URL:', error);
    return null;
  }
};

// Get the initial URL for deep linking
const getInitialURL = async () => {
  const url = await Linking.getInitialURL();
  if (url) {
    console.log('Got initial URL:', url);
    return url;
  }
  return null;
};

// Add a listener for URL events (universal links/deep links)
const addLinkingListener = (callback: (url: string) => void) => {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    console.log('Got linking event with URL:', url);
    callback(url);
  });
  
  return subscription;
};

// Configure Google OAuth provider
const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      // Get the appropriate redirect URI based on environment
      const redirectTo = await createRedirectUri();
      
      console.log('Starting Google Auth flow with redirectTo:', redirectTo);
      
      // Configure provider options
      const options = {
        redirectTo,
        skipBrowserRedirect: true, // Important for mobile
      };
      
      console.log('Auth options:', options);
      
      // Get Supabase Google auth URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options,
      });
      
      if (error) {
        console.error('Supabase OAuth URL generation error:', error);
        throw error;
      }
      
      if (!data || !data.url) {
        throw new Error('No auth URL returned from Supabase');
      }
      
      console.log('Auth URL received:', data.url);
      
      // Present the authentication flow
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );
      
      console.log('Auth session result type:', result.type);
      
      if (result.type === 'success' && result.url) {
        console.log('Auth successful, processing URL:', result.url);
        
        // Process the returned URL to extract tokens and set session
        const session = await createSessionFromUrl(result.url);
        
        if (session) {
          console.log('Successfully created session from redirect');
          return { success: true };
        } else {
          console.warn('Could not create session from redirect');
          return { success: false, message: 'Failed to create session' };
        }
      } else {
        console.log('Auth not successful, result type:', result.type);
        return { success: false, message: `Browser auth ${result.type}` };
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: errorMessage };
    }
  };
  
  return {
    signInWithGoogle,
    createSessionFromUrl,
    getInitialURL,
    addLinkingListener
  };
};

export default useGoogleAuth;