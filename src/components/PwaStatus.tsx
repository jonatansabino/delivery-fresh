import { useEffect, useState } from "react";
interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function PwaStatus() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const online = () => setOffline(false);
    const offline = () => setOffline(true);
    const install = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    const installed = () => setPrompt(null);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return (
    <>
      {offline && (
        <p role="status" className="bg-primary-soft p-3 text-center text-sm">
          Modo offline: os dados locais continuam disponíveis. Consulta de CEP e WhatsApp precisam
          de internet.
        </p>
      )}
      {prompt && (
        <div className="flex items-center justify-center gap-3 border-b bg-card p-2">
          <p className="text-xs">FreshBites na sua tela inicial</p>
          <button
            className="btn-secondary text-xs"
            onClick={async () => {
              await prompt.prompt();
              await prompt.userChoice;
              setPrompt(null);
            }}
          >
            Instalar aplicativo
          </button>
        </div>
      )}
    </>
  );
}
