import { useEffect, useRef, useState } from "react";
import {
  getCaptureContext,
  sendTransientToken,
} from "../../API/payments.api";

/* =======================
   Tipos de CyberSource
======================= */

interface FlexInstance {
  microform(
    type: "card",
    options: {
      styles: {
        input: {
          fontSize: string;
          color: string;
        };
      };
    }
  ): MicroformInstance;
}

interface MicroformInstance {
  createField(
    type: "number" | "securityCode",
    options: { placeholder: string }
  ): {
    load: (selector: string) => void;
  };

  createToken(
    data: {
      expirationMonth: string;
      expirationYear: string;
    },
    callback: (err: { message: string } | null, token: unknown) => void
  ): void;
}

declare global {
  interface Window {
    Flex: new (captureContext: string) => FlexInstance;
  }
}

export default function PayCybersourceForm() {
  const microformRef = useRef<MicroformInstance | null>(null);
  const expMonthRef = useRef<HTMLSelectElement>(null);
  const expYearRef = useRef<HTMLSelectElement>(null);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    init();
  }, []);

  const init = async (): Promise<void> => {
    try {
      const { token } = await getCaptureContext();
      loadCyberSourceScript(token);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const loadCyberSourceScript = (captureContext: string): void => {
    const payload = JSON.parse(atob(captureContext.split(".")[1]));
    const ctxData = payload.ctx[0].data;

    const script = document.createElement("script");
    script.src = ctxData.clientLibrary;
    script.integrity = ctxData.clientLibraryIntegrity;
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => initMicroform(captureContext);
    document.head.appendChild(script);
  };

  const initMicroform = (captureContext: string): void => {
    const flex = new window.Flex(captureContext);

    const microform = flex.microform("card", {
      styles: {
        input: {
          fontSize: "16px",
          color: "#333",
        },
      },
    });

    microform
      .createField("number", {
        placeholder: "4111 1111 1111 1111",
      })
      .load("#number-container");

    microform
      .createField("securityCode", {
        placeholder: "•••",
      })
      .load("#securityCode-container");

    microformRef.current = microform;
  };

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

  return (
    <div>
      <h1>Pago</h1>

      {error && <div role="alert">{error}</div>}

      <label>Nombre en la tarjeta</label>
      <input type="text" />

      <label>Número de tarjeta</label>
      <div id="number-container" className="microform-field" />

      <label>CVV</label>
      <div id="securityCode-container" className="microform-field" />

      <label>Mes</label>
      <select ref={expMonthRef}>
        <option value="01">01</option>
        <option value="02">02</option>
      </select>

      <label>Año</label>
      <select ref={expYearRef}>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>

      <button type="button" onClick={tokenize}>
        Pagar
      </button>
    </div>
  );
}
