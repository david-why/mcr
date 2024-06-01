// ==UserScript==
// @name         Niche Scraper
// @namespace    https://github.com/david-why/mcr
// @version      1.1.0
// @description  Scrape data from Niche
// @author       david-why
// @match        https://www.niche.com/*
// @icon         https://www.niche.com/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// ==/UserScript==

/* eslint-disable no-undef */

/**
 * Usage after installing the script:
 * 1. Open the page containing a Niche ranking, such as https://www.niche.com/colleges/search/all-colleges/
 * 2. Click on the Tampermonkey icon in the browser toolbar
 * 3. Click on the "Niche Scraper" menu item
 * 4. The script will scrape the page and save the data to Tampermonkey's storage
 * 5. Then the script will scrape all the college pages
 * 6. After the scraping is done, you can export the data from Tampermonkey's storage
 */

// Number of pages to scrape
const PAGES = 8;
// Miliseconds to delay between navigations
const DELAY = 2000;

// Constants about the scraping status after this navigation
// At the search page
const ST_SEARCH = 1;
// At the college page
const ST_COLLEGE = 2;
// At the college rankings page
const ST_RANKINGS = 3;
// At the college admissions page
const ST_ADMISSIONS = 4;
// At the college academics page
const ST_ACADEMICS = 5;
// Fixing missing parts of data
const ST_FIXING = 6;

console.log("Niche Scraper loaded");

function getInitialStatus(pathname, pages) {
  return {
    // base pathname
    pathname,
    // current status
    status: ST_SEARCH,
    // total pages
    pages,
    // current page
    page: 1,
    // current index
    index: 0,
  };
}

function getStatus() {
  return GM_getValue("status", { status: 0 });
}

function setStatus(status) {
  GM_setValue("status", status);
}

function clearStatus() {
  GM_deleteValue("status");
}

function clearSchools() {
  GM_deleteValue("pages");
  GM_deleteValue("schools");
}

function addPage(data) {
  const pages = GM_getValue("pages", []);
  pages.push(data);
  GM_setValue("pages", pages);
}

function addSchool(data) {
  const schools = GM_getValue("schools", []);
  schools.push(data);
  GM_setValue("schools", schools);
}

function addSchoolDetail(name, data) {
  const schools = GM_getValue("schools", []);
  schools[schools.length - 1][name] = data;
  GM_setValue("schools", schools);
}

function navigate(url) {
  setTimeout(() => (location.href = url), DELAY);
}

function getPreloadedState() {
  // find the <script>...window.__PRELOADED_STATE__={...};...</script> element
  const script = document.evaluate(
    '//script[contains(., "__PRELOADED_STATE__")]',
    document.body,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  if (script.snapshotLength !== 0) {
    eval(script.snapshotItem(0).textContent);
    return window.__PRELOADED_STATE__;
  }
}

function fixData() {
  const schools = GM_getValue("schools", []);
  let i = 0;
  for (const school of schools) {
    for (const detail of ["rankings", "admissions", "academics"]) {
      if (school[detail] === null) {
        console.log(`Missing ${detail} data for ${school.name}`);
        setStatus({ status: ST_FIXING, detail, index: i });
        navigate(`/colleges/${school.entity_data.url}/${detail}/`);
        return true;
      }
    }
    i++;
  }
  return false;
}

GM_registerMenuCommand("Start scraping", () => {
  clearSchools();
  const state = getPreloadedState();
  const dataset = state.entitySearch.response;
  const pages = Math.min(PAGES, Math.ceil(dataset.total / dataset.limit));
  console.log(`Scraping ${pages} pages of colleges!`);
  GM_setValue("status", getInitialStatus(location.pathname, pages));
  GM_setValue("pages", []);
  location.reload();
});

GM_registerMenuCommand("Stop scraping", () => {
  GM_deleteValue("status");
  location.reload();
});

GM_registerMenuCommand("Export data", () => {
  const schools = GM_getValue("schools", []);
  const pages = GM_getValue("pages", []);
  const blob = new Blob([JSON.stringify({ schools, pages })], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "niche.json";
  a.click();
  URL.revokeObjectURL(url);
});

GM_registerMenuCommand("Fix data", () => {
  if (!fixData()) {
    alert("No fixing needed!");
  }
});

GM_registerMenuCommand("Download __PRELOADED_STATE__ (debug)", () => {
  const state = getPreloadedState();
  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "preloaded.json";
  a.click();
  URL.revokeObjectURL(url);
});

GM_registerMenuCommand("Import data (debug)", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      GM_listValues().forEach((key) => GM_deleteValue(key));
      for (const key in JSON.parse(e.target.result)) {
        GM_setValue(key, JSON.parse(e.target.result)[key]);
      }
      alert("Data imported!");
    };
    reader.readAsText(file);
  };
  input.click();
});

// the actual scraping starts here

(function () {
  const status = getStatus();
  if (status.status === 0) return; // scraping not started
  switch (status.status) {
    // we're on a search page now, find the "current" college and go in
    case ST_SEARCH: {
      const state = getPreloadedState();
      const data = state.entitySearch.response;
      if (status.index >= data.limit) {
        status.page++;
        if (status.page > status.pages) {
          if (!fixData()) {
            clearStatus();
            alert("Scraping finished!!!");
          }
          return;
        }
        status.index = 0;
        setStatus(status);
        location.href = location.pathname + "?page=" + status.page;
      } else {
        if (status.index === 0) addPage(data);
        const entity = data.entities[status.index];
        status.status = ST_COLLEGE;
        setStatus(status);
        navigate("/colleges/" + entity.content.entity.url + "/");
      }
      break;
    }
    case ST_COLLEGE: {
      const state = getPreloadedState();
      const content = state.profile.content;
      addSchool(content);
      status.status = ST_RANKINGS;
      setStatus(status);
      navigate("rankings/");
      break;
    }
    case ST_RANKINGS: {
      const state = getPreloadedState();
      const content = state.profile.content;
      addSchoolDetail("rankings", content);
      status.status = ST_ADMISSIONS;
      setStatus(status);
      navigate("../admissions/");
      break;
    }
    case ST_ADMISSIONS: {
      const state = getPreloadedState();
      const content = state.profile.content;
      addSchoolDetail("admissions", content);
      status.status = ST_ACADEMICS;
      setStatus(status);
      navigate("../academics/");
      break;
    }
    case ST_ACADEMICS: {
      const state = getPreloadedState();
      const content = state.profile.content;
      addSchoolDetail("academics", content);
      status.status = ST_SEARCH;
      status.index++;
      setStatus(status);
      navigate(status.pathname + "?page=" + status.page);
      break;
    }
    case ST_FIXING: {
      const state = getPreloadedState();
      const content = state.profile.content;
      const schools = GM_getValue("schools", []);
      const school = schools[status.index];
      school[status.detail] = content;
      GM_setValue("schools", schools);
      if (!fixData()) {
        clearStatus();
        alert("Scraping finished!!!");
      }
      break;
    }
  }
})();
