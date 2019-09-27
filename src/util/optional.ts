export interface Optional<T> {
  readonly value: T;
  readonly success: boolean;
}

export const None: Optional<any> = {
  value: undefined,
  success: false,
};
