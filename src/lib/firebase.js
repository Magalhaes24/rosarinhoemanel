import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

/**
 * A configuração web do Firebase NÃO é um segredo: vai sempre dentro do bundle
 * que o browser descarrega, por muito que se esconda em variáveis de ambiente.
 * Está aqui em `import.meta.env` apenas para ser fácil trocar de projeto
 * (produção / testes) sem mexer no código.
 *
 * A proteção a sério são três coisas, todas fora deste ficheiro:
 *   1. firestore.rules  — só permite criar documentos válidos, nunca ler
 *   2. App Check        — bloqueia pedidos que não venham deste site
 *   3. Restrição da API key a referrers HTTP, na consola Google Cloud
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// `getApps()` evita inicializar duas vezes — acontece com o hot-reload do Vite
// e com o StrictMode do React, e rebenta com `app/duplicate-app`.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// App Check — impede que alguém use a tua base de dados a partir de um script
// ou de outro site. Sem a chave reCAPTCHA definida, arranca sem App Check
// (útil em desenvolvimento).
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
if (recaptchaKey && !globalThis.__appCheckIniciado) {
  globalThis.__appCheckIniciado = true
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  })
}

export const db = getFirestore(app)

// Analytics só arranca no browser e quando é suportado.
isSupported()
  .then((ok) => ok && getAnalytics(app))
  .catch(() => {})
