import {Moscow} from '../enum/moscow';

export class Issue {
  selected = false;
  constructor(name, description, number, selected, moscow) {
    this.name = name;
    this.description = description;
    this.number = number;
    this.selected = selected;
    this.moscow = Moscow.moscow;
  }
}
