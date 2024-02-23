# Dataverse-Data-Curation-Tool

The Data Curation Tool (DCT) allows data owners and curators to view summary statistics for variables and to create and edit variable-level metadata for any tabular file in a data set. This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/). The Data Curation tool is integrated into dataverse for .tab files under the configure button.

The DCT is an Angular application and uses the Angular Material Design component library.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=127759&siteUrl=https://borealisdata.ca).

## Installation
### Pre-Requisites
- NodeJS (runtime for Angular and client)
- Angular (client framework)

The Data Curation Tool was created using BunJS for the server and Angular CLI version 16.2.10.
In order to generate node_modules run `cd server && bun install && cd ../client/ && npm install`.

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

``` sh
npm install
ng serve
```

## Using the Data Curation Tool

### Main Interface

Identify a tabular (.tab) data set you want to view and/or edit. Clicking on the configure button brings up another button for the Data Curation Tool. You will then be presented with an option to continue. The main Data Curation Tool page for a variable provides two options: View and Edit.

### View

This option allows you to view summary statistics about a variable, specifically its values, categories, count, count percentage, and weighted count. A bar chart of the variable is also presented.

### Edit

Variable level metadata can be added or amended using the edit option. If you uploaded the dataset from a statistical package with pre-existing metadata, metadata associated with variables is also saved. If your dataset has variable labels they too will be added and can be edited in the tool. Other fields are "Literal Question", "Interviewer Instructions", "Post Question", "Universe", "Notes", "Group", and the option to mark a variable as a "Weight Variable" which can then be used to weight other variables.

### Groups

Groups allow you to collect variables together to form a subset of variables in the dataset. Create a group by clicking "Add Group" on the left of the screen; if the option is not visible, click on "Show Groups". You can then name your group and save it. Go back to the Data Curation Tool main page by clicking on "All Variables" above, and select the variables you wish to add to your group by checking the box next to the variable ID. By clicking on the "Add Selected to Group" text towards the top of the screen, you can populate your group.

### Saving changes

Your edits can be saved to your dataset by clicking "Save to Dataverse" towards the top right side of the page. You can also download an XML file of your metadata that contains summary statistics.

### DDI HTML Codebook

Once you have made your edits and have published the dataset, the changes will be reflected in the DDI HTML codebook within Dataverse. To view this codebook, go to the page for your file in Dataverse, click "Export Metadata", and select "DDI HTML Codebook".

![Data Curation Tool Launch Activity Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/docs/img/Data%20Curation%20Tool%20Launch%20Process.drawio.png?raw=true "Launch Activity Diagram")


![Modal Open Activity Diagram](https://github.com/scholarsportal/Dataverse-Data-Curation-Tool/blob/nana-dev/docs/img/lauch%20modal%20with%20id.drawio.png "Modal Launch Activity Diagram")
