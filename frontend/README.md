# MCR Frontend

This is the user-facing website section for the project. It is built with [Vue.js](https://vuejs.org/) and [Ant Design Vue](https://www.antdv.com/).

The website is deployed to Render at [https://mcr.onrender.com/](https://mcr.onrender.com/). The deployment is triggered automatically when a commit is pushed to the `main` branch.

## Development

1. Run `npm install` to install the dependencies.
2. Run `npm run dev` to start the development server.

If you want to enable the sharing feature, you can run the backend server (see [the backend README](../backend/README.md) for instructions) and create a `.env` file in the root directory with the following content:

```properties
VITE_SHARE_BACKEND = http://localhost:7071/api
```

Replace the URL with the URL of the backend server if it is different.

## Deployment

To deploy the website manually, run `npm run build` to build the website, and then upload the contents of the `dist` directory to the server.

## Attributions

- The favicon and the top-right-corner logo is taken from [WikiMedia Commons](https://commons.wikimedia.org/wiki/File:Eo_circle_green_white_letter-r.svg), attributed to **Emoji One**, and is licensed under the [Creative Commons Attribution-Share Alike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/deed.en) license. The image was converted to an ICO file; no other modifications were made.
