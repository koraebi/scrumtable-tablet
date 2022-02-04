import { Moscow } from '../src/enum/moscow';
import {Issue} from '../src/model/Issue';

export function getIssuesFromApi () {
  return fetch('http://10.188.111.29:3000/issues')
    .then(response => response.json())
    .catch(error => {
      console.error(error);
    });
}

export function parseIssuesInfo(json) {
  let data = [];
  let availableData = [];
  let mustData = [];
  let shouldData = [];
  let couldData = [];
  let wontData = [];
  for (let i = 0; i < json.length; i++) {
    if(json[i].moscow === undefined) 
      availableData.push(new Issue(json[i].name, json[i].selected));
    else if(json[i].moscow === Moscow.MUST)
      mustData.push(new Issue(json[i].name, json[i].selected));
    else if(json[i].moscow === Moscow.SHOULD)
      shouldData.push(new Issue(json[i].name, json[i].selected));
    else if(json[i].moscow === Moscow.COULD)
      couldData.push(new Issue(json[i].name, json[i].selected));
    else if(json[i].moscow === Moscow.WONT)
      wontData.push(new Issue(json[i].name, json[i].selected));
  }
  return data = [availableData, mustData, shouldData, couldData, wontData];
}
