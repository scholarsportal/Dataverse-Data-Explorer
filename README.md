# Dataverse-Data-Curation-Tool

[![Data Explorer Deploy](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/static.yml/badge.svg)](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/static.yml)
[![Lint/Test](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/node.js.yml/badge.svg)](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/node.js.yml)

The Data Curation Tool (DCT) allows data owners and curators to view summary statistics for variables and to create and edit variable-level metadata for any tabular file in a data set. This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/). The Data Curation tool is integrated into dataverse for .tab files under the configure button.

The DCT is an Angular application.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?siteUrl=https:%2F%2Fdemo.borealisdata.ca&dfId=40226).

## Installation

### Pre-Requisites

- NodeJS (runtime for Angular and client)
- Angular (client framework)

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

```sh
npm install
ng serve
```

## App State

![Data Explorer State Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/assets/44186742/150d423b-b520-41b8-a908-6586d7aa1084)

The tool has a state divided into three distinct state groups. 

The XML State is the final DDI file that will be uploaded to Dataverse.

The Dataset State contains information about operations being operated on the dataset (upload and download status), any extra information gained from an API call (variable cross tab data), as well as imported file information.

The UI state represents any UI changes, including any temporary visual changes to the dataset (invalid values in the chart modal). 

## Actions

![1. Data Explorer Screenshot with labels showing what triggers an action](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/assets/44186742/ad32a66e-caab-4c40-894e-8b103f3779a2)

![2. Data Explorer Screenshot with labels showing what triggers an action](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/assets/44186742/2348e3bb-ed50-4868-9326-d4bc49998665)

![3. Data Explorer Screenshot with labels showing what triggers an action](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/assets/44186742/74f97864-5673-4959-aacc-68927df80cd5)


![Data Curation Tool Launch Activity Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Init%20Sequence%20Diagram.jpg?raw=true 'Launch Activity Diagram')

![Update Component View Reference](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Update%20Component%20View.jpg?raw=true 'Update Component View Reference')

![View Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/View%20Variable.jpg?raw=true 'View Variable Sequence Diagram')

![Edit Single Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Edit%20Single%20Variable.jpg?raw=true 'Edit Single Variable Sequence Diagram')
