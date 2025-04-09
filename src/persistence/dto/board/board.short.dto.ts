export class BoardShortDto {
  id: string;

  url: string;

  name: string;

  postCount: number;

  constructor(id: string, url: string, name: string, postCount: number) {
    this.id = id;
    this.url = url;
    this.name = name;
    this.postCount = postCount;
  }
}
