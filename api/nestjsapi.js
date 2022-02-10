import {Moscow} from '../src/enum/moscow';
import {Issue} from '../src/model/Issue';

export function getIssuesFromApi() {
  return fetch('http://192.168.1.81:3000/issues')
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
    if (json[i].moscow === undefined) {
      availableData.push(
        new Issue(
          json[i].name,
          json[i].description,
          json[i].number,
          json[i].selected,
          json[i].moscow,
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
        ),
      );
    }
  }
  data = [availableData, mustData, shouldData, couldData, wontData];
  return data;
}
