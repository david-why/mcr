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
