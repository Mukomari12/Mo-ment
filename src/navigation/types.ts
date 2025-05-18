/** 
 * © 2025 Mohammad Muqtader Omari – All Rights Reserved.
 * This file is part of the "Mowment" project (™). Licensed under the MIT License.
 */

export type RootStackParamList = {
  // Auth screens
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  
  // Main app screens
  Dashboard: undefined;
  Profile: undefined;
  Settings: undefined;
  TextEntry: undefined;
  VoiceEntry: undefined;
  EntryDetails: { entryId: string };
  
  // Other screens
  NotFound: undefined;
}; 