# Dataverse-Data-Curation-Tool

_Note: this application is still in active development._

The Data Curation Tool (DCT) allows data owners and curators to view summary statistics for variables and to create and edit variable-level metadata for any tabular file in a data set. This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/). The Data Curation tool is integrated into dataverse for .tab files under the configure button.

The DCT is an Angular application and uses the Angular Material Design component library.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info).

## Installation

The Data Curation Tool was created using Angular CLI version 7.
In order to generate node_modules run `npm install`.

See [the Dataverse guide for more information about installing external tools](http://guides.dataverse.org/en/latest/installation/external-tools.html).

There are three ways to run the Data Curation Tool with Dataverse:

### GitHub Pages

The simplest way to run the Data Curation Tool is to use GitHub Pages as the host. This is not recomended for production use, but is useful for testing the application.

To do this, download `DataCuration.json` to the server running Dataverse and run the following command:

`curl -X POST -H 'Content-type: application/json' --upload-file DataCuration.json http://localhost:8080/api/admin/externalTools`

### Inside of the Dataverse application

Another way to use Data Curation tool with Dataverse is to install it in `dataverseDirectory/src/main/webapp/dct_explore`.

To do this, download the Dataverse-Data-Curation-Tool directory, download your npm packages with `npm install`, and run `ng build --prod --base-href=dct_explore`.

Next, copy the contents of `Dataverse-Data-Curation-Tool/dist` into `dataverseDirectory/src/main/webapp/dct_explore`.

Compile Dataverse and deploy it, then run the following command:

`curl -X POST -H 'Content-type: application/json' --upload-file DataCurationLocalConfigure.json http://localhost:8080/api/admin/externalTools`

### As an external application

The recommended way to install the Data Curation Tool is to use your own webserver. Download your npm packages with `npm install`, and then compile the Data Curation Tool by running `ng build --prod --base-href {URL of your application}`.

Copy the contents of `Dataverse-Data-Curation-Tool/dist` into a dedicated folder on your webserver.

In the `DataCuration.json` file, edit the following line: `"toolUrl": "https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/"`, replacing `https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/` with the url of your webserver.

Then on your local machine that runs Dataverse execute the following command:

`curl -X POST -H 'Content-type: application/json' --upload-file DataCuration.json http://localhost:8080/api/admin/externalTools`

### Note about Dataverse versions

For Dataverse `v4.16` the corresponding manifest json files are `DataCuration_v4.16.json` and `DataCurationLocalConfigure_v4.16.json`.

For Dataverse `v4.17` the corresponding manifest json files are `DataCuration_v4.17up.json` and `DataCurationLocalConfigure_v4.17up.json`.

The difference between `4.16` and `4.17` is two new parameters introduced in `4.17`: `"scope"` and `"localeCode"`.

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
