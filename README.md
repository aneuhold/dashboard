# Personal Dashboard

[![Netlify Status](https://api.netlify.com/api/v1/badges/2e7125fe-8ccd-4abf-ac69-b4acae3e3483/deploy-status)](https://app.netlify.com/sites/celadon-kataifi-627143/deploys)

## Developing

To start working on the project simply run:

- `yarn dev` then navigate to the URL it shows in the terminal

### Adding new Material UI Components

To use new Material UI components, add the package needed from [the documentation here](https://sveltematerialui.com/demo/accordion/). Then restart the dev server.

Restarting the dev server is needed whenever the theme is updated in `src/globalStyles/_smui-theme.scss` or a new component is added because it generates the base CSS file (`static/smui.css`) it looks like and makes sure only the CSS needed is compiled.

## Building

To create a production version of the app:

```bash
yarn build
```
