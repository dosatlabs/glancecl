import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { supabase } from './supabaseService';

// Required for web only but doesn't hurt to have for all platforms
WebBrowser.maybeCompleteAuthSession();

// Create a redirect URI using expo-auth-session (more reliable than hardcoding)
const redirectTo = makeRedirectUri({
  scheme: 'financeglance',
  path: 'auth/callback'
});

// This function extracts session data from the URL after OAuth redirect
const createSessionFromUrl = async (url: string) => {
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
  
  console.log('Session successfully set');
  return data.session;
};

// Configure Google OAuth provider
const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google Auth flow with redirectTo:', redirectTo);
      
      // Get Supabase Google auth URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Important for mobile
        },
      });
      
      if (error) {
        console.error('Supabase OAuth URL generation error:', error);
        throw error;
      }
      
      if (!data || !data.url) {
        throw new Error('No auth URL returned from Supabase');
      }
      
      // Log the auth URL (for debugging)
      console.log('Auth URL received, opening browser...');
      
      // Present the authentication flow
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );
      
      console.log('Auth session result type:', result.type);
      
      if (result.type === 'success') {
        console.log('Auth successful, processing URL...');
        
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
  };
};

export default useGoogleAuth;
