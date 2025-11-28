
export class SlugGenerator {
  private static readonly CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

  static generateSlug(length = 6): string {
    let slug = "";
    for (let i = 0;i<length; i++) {
      const index = Math.floor(Math.random() * this.CHARSET.length);
      slug += this.CHARSET[index];
    }
    return slug;
  }

  static validateSlug(slug: string): boolean {
    const regex = /^[a-zA-Z0-9-_]+$/;
    return regex.test(slug);
  }

}