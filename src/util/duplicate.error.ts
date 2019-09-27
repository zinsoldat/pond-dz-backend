export class DuplicateError extends Error {
  public readonly property: string;
  public readonly solution: string;
  constructor(message: string, property: string, solution?: string) {
    super(message);
    this.property = property;
    this.solution = solution;
  }
}
