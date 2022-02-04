import {Moscow} from '../enum/moscow';

export class Issue {
  selected = false;
  constructor(name, selected, moscow) {
    this.name = name;
    this.selected = selected;
    this.moscow = Moscow.moscow;
  }
}
