import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'WQ',
  pageTitle: 'LUMA - Your Conversational AI chatbot',
  pageDescription: 'LUMA is your conversational AI chatbot',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/LUMA_logo_transparent.png',
  accent: '#002cf2',
  logoDark: '/LUMA_logo_transparent.png',
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',
};
