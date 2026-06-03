import type { FinanceAppData } from "../types";

const dataEndpoint = "/api/finance-data";

export async function loadFinanceDataFile(): Promise<FinanceAppData | undefined> {
  const response = await fetch(dataEndpoint);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Unable to load finance-data.json: ${response.status}`);
  }

  return (await response.json()) as FinanceAppData;
}

export async function saveFinanceDataFile(data: FinanceAppData): Promise<void> {
  const response = await fetch(dataEndpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Unable to save finance-data.json: ${response.status}`);
  }
}
