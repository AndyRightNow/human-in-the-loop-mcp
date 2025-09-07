export type ElectronAPIResponse<T> = {
  data: T;
  error?: string;
  message?: string;
};
