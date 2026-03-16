export interface IImageProvider {
  readonly name: string;
  generate(prompt: string, style?: string): Promise<string>;
}
