# Visual SPARQL Builder

Have a look at the [project page](http://leipert.github.io/vsb)

The Visual SPARQL Builder (VSB) is a tool which allows users to create and run SPARQL queries with a graphical interface within the browser.
For the creation of a query basic understanding of linked data is needed.

## Deployment

1. Clone this repository and checkout the `dist` branch (or download a release).
1. Serve the VSB with an webserver like apache or nginx.
1. You probably want to configure the VSB for your own endpoint.
   Therefore you need to create a file named `overwrite.js` in the root folder of your VSB copy.
   For documentation of the structure of the file, please have a look [here](docs/overwrite.js.md)

## Development

1. Clone this repository (or download a release).
1. Install [node.js](http://nodejs.org/) and npm
1. Install grunt `npm install -g bower gulp`
1. Run `npm install`
1. Run `bower install`
1. Run `gulp develop` to see the app running on `http://localhost:8123/`
1. Happy Development!