import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'WQ',
  pageTitle: 'Daisy - Your Conversational AI chatbot',
  pageDescription: 'Daisy is your conversational AI chatbot',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/WQ_Daisy_Logo.svg',
  accent: '#002cf2',
  logoDark: '/WQ_Daisy_Logo.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',
};
