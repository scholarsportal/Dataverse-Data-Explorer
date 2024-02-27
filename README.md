# Dataverse-Data-Curation-Tool

The Data Curation Tool (DCT) allows data owners and curators to view summary statistics for variables and to create and edit variable-level metadata for any tabular file in a data set. This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/). The Data Curation tool is integrated into dataverse for .tab files under the configure button.

The DCT is an Angular application.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca).

## Installation

### Pre-Requisites

- NodeJS (runtime for Angular and client)
- Angular (client framework)

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

```sh
npm install
ng serve
```

![Data Curation Tool Launch Activity Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Init%20Sequence%20Diagram.jpg?raw=true 'Launch Activity Diagram')

![Update Component View Reference](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Update%20Component%20View.jpg?raw=true 'Update Component View Reference')

![View Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/View%20Variable.jpg?raw=true 'View Variable Sequence Diagram')

![Edit Single Variable](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/documentation/img/Edit%20Single%20Variable.jpg?raw=true 'Edit Single Variable Sequence Diagram')
