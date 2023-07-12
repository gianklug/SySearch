/* Dirty hack to set checkbox value on load */
if (localStorage.getItem('sy-auto-search')) {
  old_box = document.getElementById('auto-search');
  new_box = document.createElement('input');
  new_box.type = 'checkbox';
  new_box.checked = localStorage.getItem('sy-auto-search') == 'true';
  new_box.id = 'auto-search';
  old_box.parentNode.replaceChild(new_box, old_box);
}

/* Load css */
var css = document.getElementById('css');
if (localStorage.getItem('sy-theme')!=null) {
  css.innerHTML = `<link rel="stylesheet" href="css/${localStorage.getItem('sy-theme')}">`
}

/** Add event listener to the settings button */
document.getElementById('settings-link').addEventListener('click', function() {
  /* Toggle the settings menu */
  document.getElementById('settings').classList.toggle('hidden');
  document.getElementById('main').classList.toggle('hidden');
  /* Load settings from localStorage */
  document.getElementById('search-type').value =
      localStorage.getItem('sy-search-type');
  document.getElementById('theme').value = localStorage.getItem('sy-theme');
  /* Update the list of the stored wikis */
  display_wikilist();
});

/** Store settings */
document.getElementById('save-settings').addEventListener('click', function() {
  localStorage.setItem('sy-search-type',
                       document.getElementById('search-type').value);
  localStorage.setItem('sy-auto-search',
                       document.getElementById('auto-search').checked);
  localStorage.setItem('sy-theme', document.getElementById('theme').value);
  window.location.reload();
});

/** Add event listener to the add button */
document.getElementById('wikilist-add-btn')
    .addEventListener('click', function() {
      var url = document.getElementById('wikilist-add-input').value;
      var previous_urls = localStorage.getItem('sy-urls');
      if (previous_urls) {
        previous_urls = JSON.parse(previous_urls);
      } else {
        previous_urls = [];
      }
      previous_urls.push(url);
      localStorage.setItem('sy-urls', JSON.stringify(previous_urls));
      document.getElementById('wikilist-add-input').value = '';
      display_wikilist();
    });

/** Displays a list of all stored wikis */
function display_wikilist() {
  var previous_urls = localStorage.getItem('sy-urls');
  if (previous_urls) {
    previous_urls = JSON.parse(previous_urls);
  } else {
    previous_urls = [];
  }
  var wikilist = document.getElementById('wikilist');
  wikilist.innerHTML = '';
  for (var i = 0; i < previous_urls.length; i++) {
    var url = previous_urls[i];

    var name = document.createElement('span');
    name.classList.add('sy-wikilist-item-name');
    name.innerHTML = url;

    var remove = document.createElement('span');
    remove.classList.add('sy-wikilist-item-remove');
    remove.innerHTML = 'x';
    remove.addEventListener('click', function() {
      var url = this.parentNode.children[1].innerHTML;
      var previous_urls = JSON.parse(localStorage.getItem('sy-urls'));
      previous_urls.splice(previous_urls.indexOf(url), 1);
      localStorage.setItem('sy-urls', JSON.stringify(previous_urls));
      display_wikilist();
    });

    var item = document.createElement('div');
    item.classList.add('sy-wikilist-item');

    item.appendChild(remove);
    item.appendChild(name);

    wikilist.appendChild(item);
  }
}
