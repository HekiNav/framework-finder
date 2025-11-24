# Framework Finder
A web app which calculates the best framework laptop model and configuration for your needs. Built with Bootstrap, Typecript and Vite. Made for [siege](https://siege.hackclub.com)

## Features
- Data scraping with Playwright
- A modern UI with bootstrap
- Scoring system for product configurations based on user input

## Todo
- [ ] Add regions

## Demo
[Available on Github Pages](https://hekinav.github.io/framework-finder/)

## Running locally
### Scraper

1. Move to the scraper directory `cd scraper`
2. Install dependencies `npm install`
3. Install playwright dependencies (browser instances) `npx playwright install`
4. Run the script with `npm start`
5. See the data in `scraped_data.json`

### UI
1. Move to the ui directory `cd ui`
2. Install dependencies `npm install`
3. Run Vite dev server with `npm run dev`

or

3. Build `npm run build`
4. Preview build in `./dist` with `npm run preview`

## AI/LLM usage
No AI generated content/code was used in this project