import { Issue } from '../models/issue';
import { API } from '@env'

export async function getIssuesFromApi() {
  try {
    const response = await fetch(API + '/');
    return response.json();
  } catch(e) {
    console.error('Error from getIssuesFromApi() => ' + e);
  }
}

export async function addLabelToIssue(issue, newLabel) {
  try {
    const response = await fetch([API, issue.number, newLabel].join('/'), { method: 'POST' });
    return response.json();
  } catch(e) {
    console.error('Error from addLabelToIssue() => ' + e);
  }
}

export async function removeLabelToIssue(issue) {
  try {
    const response = await fetch([API, issue.number, issue.label].join('/'), { method: 'DELETE' });
    return response.json();
  } catch(e) {
    console.error('Error from removeLabelToIssue() => ' + e);
  }
}

export function parseIssuesInfo(json) {
  let availableData = [];
  let mustData = [];
  let shouldData = [];
  let couldData = [];
  let wontData = [];
  
  for (let i = 0; i < json.length; i++) {
    if (json[i].moscow === undefined) {
      availableData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
          json[i].assignee,
        ),
      );
    } else if (json[i].moscow === 'Must') {
      mustData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
          json[i].assignee,
        ),
      );
    } else if (json[i].moscow === 'Should') {
      shouldData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
          json[i].assignee,
        ),
      );
    } else if (json[i].moscow === 'Could') {
      couldData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
          json[i].assignee,
        ),
      );
    } else if (json[i].moscow === "Won't") {
      wontData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
          json[i].assignee,
        ),
      );
    }
  }

  return [availableData, mustData, shouldData, couldData, wontData];
}
