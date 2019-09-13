# Dataverse-Data-Curation-Tool

_Note: this application is still in active development._

An Angular tool for curating data by adding labels, groups, weights and other details to assist with informed reuse.

This stand-alone component is built to complement [The Dataverse Project](http://dataverse.org/) by adding data level metadata.

A demo of the tool is available here; note that this Github pages demo is **not recommended for use in a production environment**: [https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info](https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/?dfId=40620&siteUrl=https://dataverse.scholarsportal.info).

## Installation

Data Curation Tool was created using Angular CLI version 7.
In order to generate node_modules run ``npm install``

There are three ways to install Data Curation Tool with Dataverse:

1) The simplest way is to use github as webserver. This is not recomended for production use.
To do that download the config file DataCuration.json to your local computer that runs Dataverse and then call the following curl command ``curl -X POST -H 'Content-type: application/json' --upload-file DataCuration.json http://localhost:8080/api/admin/externalTools``

2) Another way to use Data Curation tool with Dataverse is to put it in {Dataverse Dir}/src/main/webapp/dct_explore. To do that, in Dataverse-Data-Curation-Tool directory run ``ng build --prod --base-href=dct_explore``.  Then copy content of  Dataverse-Data-Curation-Tool/dist directory into {Dataverse Dir}/src/main/webapp/dct_explore. Compile Dataverse and deploy it. Then run the following curl command ``curl -X POST -H 'Content-type: application/json' --upload-file DataCurationLocalConfigure.json http://localhost:8080/api/admin/externalTools``

3) The best way to use Data Curation Tool is to use your own webserver. Compile Data Curation Tool using command ``ng build --prod``. Copy content of Dataverse-Data-Curation-Tool/dist directory into dedicated folder in your webserver. In DataCuration.json file in the folowing line ``"toolUrl": "https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/"`` replace ``"https://scholarsportal.github.io/Dataverse-Data-Curation-Tool/`` with url of your webserver. Then on your local machine that runs Dataverse execute the folowing curl command ``curl -X POST -H 'Content-type: application/json' --upload-file DataCuration.json http://localhost:8080/api/admin/externalTools`` 
