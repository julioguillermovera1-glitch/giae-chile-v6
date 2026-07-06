const PWA_STATUS = {
  supported: false,
  serviceWorker: 'pending',
  installPrompt: 'unavailable',
  displayMode: 'browser'
};

let deferredInstallPrompt = null;
let installPanel = null;

function isStandaloneMode(){
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function setPanelVisible(visible){
  if(!installPanel) return;
  installPanel.classList.toggle('hidden', !visible || isStandaloneMode());
}

function dispatchStatus(){
  window.dispatchEvent(new CustomEvent('giae:pwa-status', { detail: { ...PWA_STATUS } }));
}

async function requestInstall(){
  if(!deferredInstallPrompt) return false;
  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  setPanelVisible(false);
  await prompt.prompt();
  const result = await prompt.userChoice;
  PWA_STATUS.installPrompt = result?.outcome || 'closed';
  dispatchStatus();
  return result?.outcome === 'accepted';
}

function createInstallPanel(){
  if(installPanel || isStandaloneMode()) return;
  installPanel = document.createElement('aside');
  installPanel.className = 'pwa-install-panel hidden';
  installPanel.innerHTML = '<div><strong>GIAE listo para instalar</strong><span>Modo local para PC y celular.</span></div><button type="button" data-pwa-install>Instalar</button><button type="button" class="pwa-dismiss" data-pwa-dismiss aria-label="Cerrar">x</button>';
  document.body.appendChild(installPanel);
  installPanel.querySelector('[data-pwa-install]').addEventListener('click', requestInstall);
  installPanel.querySelector('[data-pwa-dismiss]').addEventListener('click', () => setPanelVisible(false));
}

export function registerGiaePwa(){
  window.GIAE = window.GIAE || {};
  PWA_STATUS.supported = 'serviceWorker' in navigator;
  PWA_STATUS.displayMode = isStandaloneMode() ? 'standalone' : 'browser';
  window.GIAE.pwa = { status: PWA_STATUS, install: requestInstall };
  createInstallPanel();

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    PWA_STATUS.installPrompt = 'available';
    setPanelVisible(true);
    dispatchStatus();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    PWA_STATUS.installPrompt = 'installed';
    PWA_STATUS.displayMode = 'standalone';
    setPanelVisible(false);
    dispatchStatus();
  });

  if(!PWA_STATUS.supported){
    PWA_STATUS.serviceWorker = 'unsupported';
    dispatchStatus();
    return;
  }

  const serviceWorkerUrl = new URL('../sw.js', import.meta.url);
  const serviceWorkerScope = new URL('../', import.meta.url);
  navigator.serviceWorker.register(serviceWorkerUrl, { scope: serviceWorkerScope.pathname })
    .then(registration => {
      PWA_STATUS.serviceWorker = registration.active ? 'active' : 'registered';
      dispatchStatus();
    })
    .catch(error => {
      PWA_STATUS.serviceWorker = 'failed';
      PWA_STATUS.error = error?.message || String(error);
      dispatchStatus();
    });
}
