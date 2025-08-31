export interface Option<TValue = string | number, TData = undefined> {
  value: TValue;
  label: string;
  /** fixed option that can't be removed. */
  fixed?: boolean;

  data?: TData;
  /** Group the options by providing key. */
  [key: string]: string | number | boolean | TData | undefined | TValue;
}

export interface GroupOption<TValue = string | number, TData = undefined> {
  [key: string]: Option<TValue, TData>[];
}
