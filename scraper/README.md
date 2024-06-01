# MCR Scraper

This module of the project focuses on scraping content from online sources.

## Current sources

- [Niche](https://niche.com)

## Usage

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension for your browser.
2. Install the [MCR Scraper](./scrape.user.js) script.
3. Go to a Niche.com page that contains a college ranking, such as [Best Colleges](https://www.niche.com/colleges/search/best-colleges/).
4. Click the Tampermonkey icon in your browser and click "Start Scraping" to run the script.
5. Wait for the script to finish. An alert will appear when it is done.
6. Click the Tampermonkey icon again and click "Export data" to save the scraped data to a file.
7. Run `python3 parse_niche.py downloaded_file.json output.json` to process the data and save it to a CSV file. (Replace `python3` with `py` if you are on Windows.)
8. This `output.json` file can be used by the frontend by placing it in the `frontend/src/assets` directory, with the name `data.json`.
