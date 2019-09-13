# Dataverse-Data-Curation-Tool

_Note: this application is still in active development._

An Angular tool for curating data by adding labels, groups, weights and other details to assist with informed reuse.

This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/) by adding data level metadata.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info).

## Installation

The Data Curation Tool was created using Angular CLI version 7.
In order to generate node_modules run `npm install`.

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

### As an external tool

The recommended way to install the Data Curation Tool is to use your own webserver. Download your npm packages with `npm install`, and then compile the Data Curation Tool by running `ng build --prod`.

Copy the contents of `Dataverse-Data-Curation-Tool/dist` into a dedicated folder on your webserver.

In the `DataCuration.json` file, edit the folowing line: `"toolUrl": "https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/"`, replacing `https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/` with the url of your webserver.

Then on your local machine that runs Dataverse execute the folowing command:

`curl -X POST -H 'Content-type: application/json' --upload-file DataCuration.json http://localhost:8080/api/admin/externalTools`
