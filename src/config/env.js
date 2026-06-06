export const firebaseConfig = {
  apiKey: 'AIzaSyBxmRRdxMomZP2eo7AS-UXCXD7-adk40Hk',
  authDomain: '',
  projectId: 'nsrit-school-2b749',
  storageBucket: 'nsrit-school-2b749.firebasestorage.app',
  messagingSenderId: '',
  appId: '1:234250139606:android:4781352049a208426b9677',
};

export const apiConfig = {
  baseURL: '',
  timeout: 15000,
};

export const dataConnectConfig = {
  projectId: firebaseConfig.projectId || 'nsrit-school-2b749',
  location: 'asia-south1',
  serviceId: 'nsrit-school-2b749-service',
  connectorId: 'nsrit',
  apiBaseURL: 'https://firebasedataconnect.googleapis.com/v1',
};

export const authConfig = {
  disablePhoneAuthAppVerificationForTesting: true,
};
