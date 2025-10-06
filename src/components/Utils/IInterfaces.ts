export interface IPageProps<T> {
  page: number;
  pageSize: number;
  total: number;
  data: T[];
  filters: { key: string; value: any }[];
  loading: boolean;
}

export interface IActionProps<T> {
  data: T | undefined;
  openUpsert: boolean;
  openDelete: boolean;
}

export interface IAbsenceGeo {
  masuk: { lat: number; lon: number; acc: number };
  pulang: { lat: number; lon: number; acc: number };
}
