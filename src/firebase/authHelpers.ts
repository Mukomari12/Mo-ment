/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

import { 
  sendEmailVerification, 
  applyActionCode, 
  sendPasswordResetEmail,
  confirmPasswordReset
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';

/**
 * Sends a verification email to the specified user
 */
export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
    return Promise.resolve();
  } catch (error: any) {
    return Promise.reject(error);
  }
};

/**
 * Verifies a user's email using the action code from the verification link
 */
export const verifyEmail = async (actionCode: string): Promise<void> => {
  try {
    await applyActionCode(auth, actionCode);
    return Promise.resolve();
  } catch (error: any) {
    return Promise.reject(error);
  }
};

/**
 * Sends a password reset email to the specified email address
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return Promise.resolve();
  } catch (error: any) {
    return Promise.reject(error);
  }
};

/**
 * Confirms a password reset using the action code from the reset link
 */
export const confirmPasswordChange = async (actionCode: string, newPassword: string): Promise<void> => {
  try {
    await confirmPasswordReset(auth, actionCode, newPassword);
    return Promise.resolve();
  } catch (error: any) {
    return Promise.reject(error);
  }
};

/**
 * Parses a Firebase action URL to extract the mode and action code
 */
export const parseActionURL = (url: string): { mode: string | null; actionCode: string | null } => {
  try {
    const urlObj = new URL(url);
    const mode = urlObj.searchParams.get('mode');
    const actionCode = urlObj.searchParams.get('oobCode');
    
    return { mode, actionCode };
  } catch (error) {
    console.error('Invalid URL format:', error);
    return { mode: null, actionCode: null };
  }
}; 