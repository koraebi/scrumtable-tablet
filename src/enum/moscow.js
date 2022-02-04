export class Moscow {
  static MUST = new Moscow('Must');
  static SHOULD = new Moscow('Should');
  static COULD = new Moscow('Could');
  static WONT = new Moscow("Won't");

  constructor(name) {
    this.name = name
  }
}