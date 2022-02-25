import { Issue } from '../models/issue';
import { API, GITHUB_PAT } from '@env'

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

export async function addLabel(issue, newLabel) {
  try {
    const response = await fetch('https://api.github.com/repos/Scrumtable/web/issues/' + issue.number + '/labels', { 
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

export async function removeLabels(issue) {
  try {
    const response = await fetch('https://api.github.com/repos/Scrumtable/web/issues/' + issue.number + '/labels', { 
      method: 'DELETE', 
      headers: new Headers({
        "Authorization": 'Bearer ' + GITHUB_PAT,
        'Content-Type': 'application/json'
      })
    });

    return response.json();
  } catch(e) {
    console.error('Error from removeLabels() => ' + e);
  }
}

export async function parseIssuesInfo(json) { 
  let mustIssues = [];
  let shouldIssues = [];
  let couldIssues = [];
  let wontIssues = [];
  let todoIssues = [];
  
  for (let i = 0; i < json.length; i++) {
    if (json[i].labels.length) {
      if (json[i].labels[0].name === 'Must' && mustIssues.length < 5) {
        mustIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Must',
            json[i].assignee
          )
        );
      } else if (json[i].labels[0].name === 'Should' && shouldIssues.length < 5) {
        shouldIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Should',
            json[i].assignee
          )
        );
      } else if (json[i].labels[0].name === 'Could' && couldIssues.length < 5) {
        couldIssues.push(
          new Issue(
            json[i].title,
            json[i].body,
            json[i].number,
            'Should',
            json[i].assignee
          )
        );
      } else if (json[i].labels[0].name === "Won't" && wontIssues.length < 5) {
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
    } else if (todoIssues.length < 5) {
      todoIssues.push(
        new Issue(
          json[i].title,
          json[i].body,
          json[i].number,
          "",
          json[i].assignee
      ))
    }
  }

  return [mustIssues, shouldIssues, couldIssues, wontIssues, todoIssues];
}
