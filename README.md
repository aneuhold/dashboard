# Personal Dashboard

Left off working towards turning things into contexts as far as the project type, then adding in things there from the perspective of tools.

## Developing

To start working on the project simply run:

- `yarn dev` then navigate to the URL it shows in the terminal

### Adding new Material UI Components

To use new Material UI components, add the package needed from [the documentation here](https://sveltematerialui.com/demo/accordion/). Then restart the dev server.

Restarting the dev server is needed whenever the theme is updated in `src/globalStyles/_smui-theme.scss` or a new component is added because it generates the base CSS file (`static/smui.css`) it looks like and makes sure only the CSS needed is compiled.

## Building

To create a production version of your app:

```bash
yarn build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
