export type EndaomentGrantTransfer = {
    id: string;
    type: string;
    status: string;
    transactionHash: string;
    netAmount: string;
    fee: string;
    createdAtUtc: string;
    destinationOrg: {
      id?: string;
      ein?: string;
      name?: string;
      description?: string;
      website?: string;
      logo?: string;
    };
    purpose?: string;
    chainId?: number;
  };
  
  const ENDPOINT = '/grants';
  
  const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
  };
  
  const toStringOrEmpty = (value: unknown): string => {
    return typeof value === 'string' ? value : '';
  };
  
  /**
   * Fetch all Endaoment grant transfers for the Gud Fund,
   * then normalize & filter to the approved GrantTransfer entries.
   */
  export async function fetchApprovedGrantsForGudFund(): Promise<EndaomentGrantTransfer[]> {
    const res = await fetch(ENDPOINT);
    if (!res.ok) {
      throw new Error(`Endaoment request failed: ${res.status} ${res.statusText}`);
    }
  
    const json: unknown = await res.json();
    if (!Array.isArray(json)) return [];
  
    const normalized: EndaomentGrantTransfer[] = json
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => {
        const destinationOrg = isRecord(item.destinationOrg) ? item.destinationOrg : {};
  
        return {
          id: toStringOrEmpty(item.id),
          type: toStringOrEmpty(item.type),
          status: toStringOrEmpty(item.status),
          transactionHash: toStringOrEmpty(item.transactionHash),
          netAmount: toStringOrEmpty(item.netAmount),
          fee: toStringOrEmpty(item.fee),
          createdAtUtc: toStringOrEmpty(item.createdAtUtc),
          destinationOrg: {
            id: toStringOrEmpty(destinationOrg.id),
            ein: toStringOrEmpty(destinationOrg.ein),
            name: toStringOrEmpty(destinationOrg.name),
            description: toStringOrEmpty(destinationOrg.description),
            website: toStringOrEmpty(destinationOrg.website),
            logo: toStringOrEmpty(destinationOrg.logo),
          },
          purpose: toStringOrEmpty(item.purpose),
          chainId: typeof item.chainId === 'number' ? item.chainId : undefined,
        };
      })
      .filter((t) => t.type === 'GrantTransfer' && t.status === 'Approved' && t.transactionHash.length > 0);
  
    return normalized;
  }
  
  