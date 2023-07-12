/* Globals */
var timer = 0;

/**
 * Fetches Search API results for the given query.
 * @param {String} url - The url of the wiki to fetch results from.
 */

function urlEncode(params) {
  data = "";
  Object.keys(params).forEach(function(
      key) { data += "&" + key + "=" + params[key]; });
  return data;
}

async function fetchSearchResults(url) {
  var apipath = url + "/api.php";
  var searchquery = document.getElementById("search").value;
  if (localStorage.getItem("sy-search-type") == "partial") {
    searchquery = `*${searchquery.replace("/ /g", "*")}*`;
  }
  var params = {
    action : "query",
    list : "search",
    srsearch : searchquery,
    format : "json",
    srwhat : "text",
    srprop : "size|wordcount|timestamp|snippet|categorysnippet",
  };

  let response = await fetch(apipath, {
    method : 'POST',
    body : urlEncode(params),
    headers : {'Content-Type' : 'application/x-www-form-urlencoded'}
  })
  response = await response.json();
  results = (response["query"]["search"]);
  for (var i = 0; i < results.length; i++) {
    results[i]["score"] = calculateScore(searchquery, results[i]);
    results[i]["wiki"] = url;
  }

  if (results.length == 0 &&
      localStorage.getItem("sy-search-type") == "automatic") {
    localStorage.setItem("sy-search-type", "partial");
    results = await fetchSearchResults(url);
    localStorage.setItem("sy-search-type", "automatic");
  }
  return results;
}

/**
 * Searches for the given query in all defined wikis.
 * Displays the results in the searchresults div.
 */
async function search() {
  if (document.getElementById("search").value == "") {
    document.getElementById("searchresults").innerHTML = '';
    document.getElementById("resultcount").innerHTML = '';
    return;
  }
  total_results = [];
  document.getElementById("searchresults").innerHTML =
      "<div class='lds-ripple'><div></div><div></div></div>";
  siteurls = JSON.parse(localStorage.getItem("sy-urls"));
  for (var i = 0; i < siteurls.length; i++) {
    response = await fetch(siteurls[i]);
    if (response.url.includes("sso") || !response.ok) {
      fake_result = {
        "wiki" : "",
        "title" : "Log-in to SSO required.",
        "snippet" : "Please log-in to the <a href='" + response.url +
                        "' target='_blank'>SSO/Wiki</a> to view this page.",
        "timestamp" : "",
        "score" : 0
      };
      total_results = [ fake_result ];
    } else {
      current_results = await fetchSearchResults(siteurls[i]);
      total_results = total_results.concat(current_results);
    }
    total_results = removeDuplicates(total_results)
    total_results.sort(function(a, b) { return b["score"] - a["score"]; });
    displayResults(total_results);
  }
}

/** Removes all duplicates from the given array. */
function removeDuplicates(results) {
  var unique_results = [];
  var pageids = [];
  for (var i = 0; i < results.length; i++) {
    if (results[i] == undefined) {
      continue;
    }
    if (pageids.includes(results[i]["pageid"])) {
      continue;
    }
    unique_results.push(results[i]);
    pageids.push(results[i]["pageid"]);
  }
  return unique_results;
}

/** Calculates the score of the given query in the given result. */
function calculateScore(query, result) {
  queries = query.split(" ");
  var score = 0;
  var result_title = result["title"];
  var result_snippet = result["snippet"];
  // Loop through each query word
  for (var i = 0; i < queries.length; i++) {
    // Check if the query word is in the title
    if (result_title.toLowerCase().includes(queries[i].toLowerCase())) {
      match = queries[i].length / result_title.length;
      score += 2 + match;
      if (match > 0.8) {
        score += 1;
      }
    }
    // Check if the query word is in the snippet
    var matches = result_snippet.match(
        new RegExp(queries[i].replace("*", "[^\s]*"), "gi"));
    if (matches != null) {
      score += matches.length;
    }
  }
  return score;
}

/**
 * Displays the given results in the searchresults div
 * Shows error message if no results are found.
 * @param {Array} results - The results to display.
 */
async function displayResults(results) {
  html = "";
  if (results.length == 0) {
    html += "<div class='sy-result'>No results found.</div>";
  }
  for (var i = 0; i < results.length; i++) {

    /* Only display wiki if set */
    if (results[i]["wiki"] != "") {
      html += "<div class='sy-result'><h2><u><a target='_blank' href=\"" +
              results[i]["wiki"] + "/index.php/" + encodeURI(results[i]["title"]) + "\">" +
              results[i]["title"] + "</a></u></h2>";
      html +=
          "in <b>" +
          results[i]["wiki"].substr(results[i]["wiki"].lastIndexOf("/") + 1) +
          "</b><br>";
      if (results[i]["categorysnippet"] != "") {
        html += "<b>Categories:</b> " + results[i]["categorysnippet"] + "<br>";
      }
    } else {
      html += "<div class='sy-result'><h2>" + results[i]["title"] + "</h2>";
    }

    /* Only display timestamp if set */
    html += results[i]["snippet"];
    if (results[i]["timestamp"] != "") {
      html += "<br><i>" + results[i]["timestamp"] +
              "</i> - Score: " + Math.round(results[i]["score"] * 100) / 100;
    }
    html += "</div>";
  }
  document.getElementById("resultcount").innerHTML =
      results == "1" ? results.length + " result" : results.length + " results";
  document.getElementById("searchresults").innerHTML = html;
}

/**
 * Adds event listeners to the search/settings button and the keyboard input.
 */
document.addEventListener('DOMContentLoaded', function() {
  var link = document.getElementById('search-btn');
  link.addEventListener('click', function() { search(); });
  var input = document.getElementById("search");

  if (localStorage.getItem("sy-auto-search") == "true") {
    input.addEventListener("input", function(event) {
      clearTimeout(timer);
      /* Only search if no input for 500ms */
      timer = setTimeout(function() { search(); }, 500);
    });
  }

  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      search();
    }
  });
});

/* Add event listener to the popout button */
document.getElementById("sy-popout").addEventListener("click", function() {
  window.open("index.html", "gc-popout-window", "width=348,height=654");
});

/* Hide the popout button if in popout */
if (window.name == "gc-popout-window") {
  document.getElementById("sy-popout").style.display = "none";
}

/**
 * Focus input field on load.
 */
window.onload =
    function() { var input = document.getElementById("search").focus(); }

/** First run*/
if (localStorage.getItem("sy-urls") == null) {
  document.getElementById("searchresults").innerHTML = `
  <h2>Welcome to SySearch</h2>
  <p>This is a simple search engine for multiple wikis.</p>
  <p>To get started, click <u>settings</u> and add the URLs of some wikis.</p>
  `;
  if (localStorage.getItem("sy-auto-search") === null) {
    localStorage.setItem("sy-auto-search", "true");
  }
  if (localStorage.getItem("sy-search-type") === null) {
    localStorage.setItem("sy-search-type", "automatic");
  }
  if (localStorage.getItem("sy-theme") === null) {
    localStorage.setItem("sy-theme", "style.css");
  }
}
