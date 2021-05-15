export class QueryParam {
  constructor(private value: string | string[]) {}

  first(): string {
    return Array.isArray(this.value) ? this.value[0] : this.value;
  }
}
