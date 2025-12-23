import { useEffect, useRef, useState } from "react";
import { getCaptureContext, sendTransientToken } from "../../API/payments.api";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Select } from "../components/Select";

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
     Generar opciones dinámicas
  ======================= */
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const years = Array.from({ length: 10 }, (_, i) => (2025 + i).toString());

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
     Render
  ======================= */
  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Pago</h1>

      {error && <div className="text-red-500">{error}</div>}

      <Input label="Nombre en la tarjeta" placeholder="Juan Pérez" />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Número de tarjeta</label>
        <div id="number-container" className="px-3 py-2 border rounded-md h-10" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">CVV</label>
        <div id="securityCode-container" className="px-3 py-2 border rounded-md h-10" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Mes" ref={expMonthRef}>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <Select label="Año" ref={expYearRef}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      <Button type="button" onClick={tokenize}>
        Pagar
      </Button>
    </div>
  );
}