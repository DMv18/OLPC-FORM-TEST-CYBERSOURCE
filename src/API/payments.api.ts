const API_BASE = import.meta.env.VITE_API_URL;

export interface CaptureContextResponse {
  token: string;
}

export async function getCaptureContext(): Promise<CaptureContextResponse> {
    console.log("API_BASE:", API_BASE);
  const response = await fetch(
    `${API_BASE}/api/payments/generate-capture-context`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo capture context");
  }

  return response.json();
}

export async function sendTransientToken(transientToken: any) {
  const response = await fetch(
    `${API_BASE}/api/payments/charge`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ TransientToken: transientToken }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}
