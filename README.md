# MCR: My College Ranking

> Create a college ranking to your standards!

## Overview

MCR is a web application that allows users to create their own college ranking based on their own standards. Users can add colleges to their ranking and rank them based on their own criteria. Users can also view other users' rankings and see how their rankings compare to others. The website is deployed to Render at [https://mcr.onrender.com/](https://mcr.onrender.com/).

## Parts

- [Frontend](frontend)
  - This is the frontend of the application. It is built using Vue.js and Vite. See the [frontend README](frontend/README.md) for more information.
- [Backend](backend)
  - This is the backend of the application. It stores rankings shared by users. It is built using Python, Azure Functions, and Azure Cosmos DB. See the [backend README](backend/README.md) for more information.
- [Scraper](scraper)
  - This is the scraper for the application. It scrapes college data from Niche.com. It is a Tampermonkey Userscript used for scraping and a Python script that handles parsing the scraped data. See the [scraper README](scraper/README.md) for more information.

## Quickstart

To run the application locally, follow these steps:

1. Clone the repository.
2. Obtain the college data by following the instructions in the [scraper README](scraper/README.md). **Make sure you don't forget to run the Python script.** If you already have the data, you can skip this step.
3. Place the `data.json` file in the `frontend/src/assets` folder.
4. Build the frontend by following the instructions in the [frontend README](frontend/README.md).
5. The website is now ready to be served. You can use a static file server like `serve` or `python3 -m http.server` to serve the `frontend/dist` folder.
