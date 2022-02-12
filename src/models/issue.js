export class Issue {
  selected = false;
  constructor(name, description, number, selected, moscow) {
    this.name = "#" + number + " : " + name;
    this.description = description;
    this.id = number;
    this.selected = selected;
    this.label = moscow === undefined ? 'X' : moscow;
  }
}
