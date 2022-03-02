import { Issue } from '../models/issue';
import { GITHUB_PAT } from '@env'

export async function getIssuesFromApi() {
  try {
    const response = await fetch('https://api.github.com/repos/Scrumtable/web/issues', { 
      method: 'GET', 
      headers: new Headers({
        "Authorization": 'Bearer ' + GITHUB_PAT,
        'Content-Type': 'application/json'
      })
    });
    
    return response.json();
  } catch(e) {
    console.error('Error from getIssuesFromApi() => ' + e); 
  }
}

export async function setLabel(issueNumber, newLabel) {
  try {
    const response = await fetch('https://api.github.com/repos/Scrumtable/web/issues/' + issueNumber + '/labels', { 
      method: 'PUT', 
      body: JSON.stringify({labels: [newLabel]}),
      headers: new Headers({
        "Authorization": 'Bearer ' + GITHUB_PAT,
        'Content-Type': 'application/json'
      })
    });

    return response.json();
  } catch(e) {
    console.error('Error from addLabel() => ' + e);
  }
}

export async function parseIssuesInfo(json) { 
  let mustIssues = [];
  let shouldIssues = [];
  let couldIssues = [];
  let wontIssues = [];
  
  for (let i = 0; i < json.length; i++) {
    if (json[i].labels.length) {
      if (json[i].labels.findIndex(label => label.name === 'Must') !== -1) {
        mustIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Must',
            json[i].assignee
          )
        );
      } else if (json[i].labels.findIndex(label => label.name === 'Should') !== -1) {
        shouldIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Should',
            json[i].assignee
          )
        );
      } else if (json[i].labels.findIndex(label => label.name === 'Could') !== -1) {
        couldIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Could',
            json[i].assignee
          )
        );
      } else if (json[i].labels.findIndex(label => label.name === "Won't") !== -1) {
        wontIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            "Won't",
            json[i].assignee
          )
        );
      }
    }
  }

  return [mustIssues, shouldIssues, couldIssues, wontIssues];
}
