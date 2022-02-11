import {Moscow} from '../enum/moscow';

export class Issue {
  selected = false;
  constructor(name, description, number, selected, moscow) {
    this.name = "#" + number + " : " + name;
    this.description = description;
    this.id = number;
    this.selected = selected;
    this.moscow = moscow;
  }
}
