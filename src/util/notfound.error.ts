export class NotFoundError extends Error {
  public readonly property: string;
  public readonly solution: string;
  constructor(message: string, solution?: string) {
    super(message);
    this.solution = solution;
  }
}
