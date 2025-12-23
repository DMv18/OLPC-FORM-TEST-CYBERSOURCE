import { useEffect, useRef, useState } from "react";
import { getCaptureContext, sendTransientToken } from "../../API/payments.api";

/* =======================
   Tipos de CyberSource
======================= */

interface FlexInstance {
  microform(
    type: "card",
    options: {
      styles: { input: { fontSize: string; color: string } };
    }
  ): MicroformInstance;
}

interface MicroformInstance {
  createField(
    type: "number" | "securityCode",
    options: { placeholder: string }
  ): { load: (selector: string) => void };
  createToken(
    data: { expirationMonth: string; expirationYear: string },
    callback: (err: { message: string } | null, token: unknown) => void
  ): void;
}

declare global {
  interface Window {
    Flex: new (captureContext: string) => FlexInstance;
  }
}

/* =======================
   Hook para cargar scripts externos
======================= */
const useLoadScript = (
  src: string,
  integrity?: string,
  onLoad?: () => void
) => {
  useEffect(() => {
    if (!src) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    if (integrity) script.integrity = integrity;
    if (onLoad) script.onload = onLoad;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [src, integrity, onLoad]);
};

/* =======================
   Componente principal
======================= */

export default function PayCybersourceForm() {
  const microformRef = useRef<MicroformInstance | null>(null);
  const expMonthRef = useRef<HTMLSelectElement>(null);
  const expYearRef = useRef<HTMLSelectElement>(null);

  const [error, setError] = useState<string>("");
  const [captureContext, setCaptureContext] = useState<string>("");
  const [scriptData, setScriptData] = useState<{ src: string; integrity: string } | null>(null);

  /* =======================
     Obtener capture context
  ======================= */
  useEffect(() => {
    const initCaptureContext = async () => {
      try {
        const { token } = await getCaptureContext();
        if (!token) throw new Error("No se obtuvo capture context");

        // Guardamos el token completo para inicializar Flex
        setCaptureContext(token);

        // Decodificamos para obtener script e integridad
        const payload = JSON.parse(atob(token.split(".")[1]));
        const ctxData = payload.ctx[0].data;
        setScriptData({ src: ctxData.clientLibrary, integrity: ctxData.clientLibraryIntegrity });
      } catch (e) {
        setError((e as Error).message);
      }
    };

    initCaptureContext();
  }, []);

  /* =======================
     Cargar script CyberSource
  ======================= */
  useLoadScript(scriptData?.src ?? "", scriptData?.integrity, () => {
    if (!captureContext) {
      setError("Capture context no válido para inicializar Flex");
      return;
    }

    try {
      const flex = new window.Flex(captureContext);
      const microform = flex.microform("card", {
        styles: { input: { fontSize: "16px", color: "#333" } },
      });

      microform.createField("number", { placeholder: "4111 1111 1111 1111" }).load("#number-container");
      microform.createField("securityCode", { placeholder: "•••" }).load("#securityCode-container");

      microformRef.current = microform;
    } catch (e) {
      setError((e as Error).message);
    }
  });

  /* =======================
     Tokenizar tarjeta
  ======================= */
  const tokenize = (): void => {
    if (!microformRef.current) return;

    microformRef.current.createToken(
      {
        expirationMonth: expMonthRef.current?.value ?? "",
        expirationYear: expYearRef.current?.value ?? "",
      },
      async (err, token) => {
        if (err) {
          setError(err.message);
          return;
        }

        try {
          const result = await sendTransientToken(token);
          console.log("Pago procesado", result);
        } catch (e) {
          setError((e as Error).message);
        }
      }
    );
  };

  /* =======================
     Generar opciones dinámicas
  ======================= */
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const years = Array.from({ length: 10 }, (_, i) => (2025 + i).toString());

  /* =======================
     Render
  ======================= */
  return (
    <div>
      <h1>Pago</h1>
      {error && <div role="alert" style={{ color: "red" }}>{error}</div>}

      <label>Nombre en la tarjeta</label>
      <input type="text" />

      <label>Número de tarjeta</label>
      <div id="number-container" className="microform-field" />

      <label>CVV</label>
      <div id="securityCode-container" className="microform-field" />

      <label>Mes</label>
      <select ref={expMonthRef}>
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <label>Año</label>
      <select ref={expYearRef}>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button type="button" onClick={tokenize}>Pagar</button>
    </div>
  );
}
