export class Issue {
  selected = false;
  constructor(name, description, number, label, assignee) {
    this.name = name;
    this.number = number;
    this.description = description;
    this.id = '#' + number;
    this.label = label;
    this.displayAssignee = assignee?.login ? 'flex' : 'none';
    this.assigneeAvatarUrl = assignee?.avatar_url ?? 'https://avatars.githubusercontent.com/u/54991044?s=40&v=4';
    this.assigneeName = assignee?.login ?? '';
    this.selectionColor = "#4734D3";
    switch(label) {
      case 'Must': 
        this.textColor = '#5AA7EA';
        this.backgroundColor = '#10233B';
        break;
      case 'Should': 
        this.textColor = '#B9ABC1';
        this.backgroundColor = '#171B3A';
        break;
      case 'Could': 
        this.textColor = '#68A7CD';
        this.backgroundColor = '#10233B';
        break;
      case "Won't": 
        this.textColor = '#B4818B';
        this.backgroundColor = '#201B2A';
        break;
      default :
        this.displayLabel = 'none';
        this.textColor = 'black';
        this.backgroundColor = 'white';
    }
  }
}
