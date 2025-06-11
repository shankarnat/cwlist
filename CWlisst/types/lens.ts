export interface Lens {
  id: string;
  name: string;
  status: 'Draft' | 'Published';
  desc: string;
  lastRefreshed: string;
  originalStatus?: 'Draft' | 'Published';
}

export interface CloneData {
  originalLens: Lens;
  totalCount: number;
  allSelectedIds: string[];
}