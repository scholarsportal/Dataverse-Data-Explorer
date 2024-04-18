# Dataverse-Data-Curation-Tool

[![Data Explorer Deploy](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/static.yml/badge.svg)](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/static.yml)
[![Lint/Test](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/node.js.yml/badge.svg)](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/actions/workflows/node.js.yml)

The Data Curation Tool (DCT) allows data owners and curators to view summary statistics for variables and to create and edit variable-level metadata for any tabular file in a data set. This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/). The Data Curation tool is integrated into dataverse for .tab files under the configure button.

The DCT is an Angular application.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?siteUrl=https:%2F%2Fdemo.borealisdata.ca&dfId=40226).

## Installation

### Pre-Requisites

- NodeJS (runtime for Angular and client)

  For development, I recommend using a Node Version manager such as [nvm](https://github.com/creationix/nvm) or [fnm](https://github.com/Schniz/fnm). Otherwise, NodeJS can be found [here](https://nodejs.org/en/download).
- Angular (client framework)

  ```npm install -g @angular/cli```

Integrating Data Explorer in your institution? See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

Now to start development.

```sh
npm install
ng serve
```

### Variable Selection Context

When a user selects a variables, navigates to another group, and makes another selection, the app holds the selection information for both contexts in which the selection in made. In simple terms the user does not have to worry about losing their selection when they change groups.

![Data Curation Tool Launch Activity Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Init%20Sequence%20Diagram.jpg?raw=true 'Launch Activity Diagram')

![Update Component View Reference](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Update%20Component%20View.jpg?raw=true 'Update Component View Reference')

![View Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/View%20Variable.jpg?raw=true 'View Variable Sequence Diagram')

![Edit Single Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Edit%20Single%20Variable.jpg?raw=true 'Edit Single Variable Sequence Diagram')
