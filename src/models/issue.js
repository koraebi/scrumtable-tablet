export class Issue {
  selected = false;
  constructor(name, description, number, label, assignee) {
    this.name = name;
    this.number = number;
    this.description = description;
    this.id = '#' + number;
    this.label = label;
    this.assigneeName = assignee?.login ?? '';
    this.selectionColor = "#4734D3";
  }
}
