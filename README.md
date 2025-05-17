# 🔥 Jellyfin ratings 🔥

![logo](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/logo.png)

Replaces jellyfish ratings with ratings from various sources (IMDb, Trakt, Imdb, Letterboxd, Tomato, Popcorn, Metacritic, RogerEbert, and MyAnimeList) obtained from mdblist.com
To get ratings, you must have a plugin for getting data from TMDB and an ID.

Example

![1](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/1.jpg)

# 📌 Installation 📌

Before starting the installation, you need to get an API key on the site [mdblist.com](https://mdblist.com/preferences)

![apikey](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/api%20key.jpg)

# 1. Installation on a single browser using third-party programs (It will only work in the browser in which you install the script)

To use these userscripts, you need a userscript add-on or extension such as [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), or [Greasemonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/) installed in your browser. More information can be found [here](https://stackapps.com/tags/script/info), [here](https://openuserjs.org/about/Userscript-Beginners-HOWTO), or [here](https://userscripts-mirror.org/about/installing.html).

[![Source](https://github.com/Druidblack/MusicBrainz-UserScripts/blob/main/add/Source-button.png)](https://github.com/Druidblack/jellyfin_ratings/blob/main/jellyfin_ratings.user.js)
[![Install](https://github.com/Druidblack/MusicBrainz-UserScripts/blob/main/add/Install-button.png)](https://github.com/Druidblack/jellyfin_ratings/raw/main/jellyfin_ratings.user.js)

# 2. Plug-in installation (it will work wherever the web interface is used)
***This is the most convenient installation method.***

Install the plugin [Jellyfin Custom JavaScript Plugin](https://github.com/johnpc/jellyfin-plugin-custom-javascript)

Copy the contents of the file [ratings.js](https://github.com/Druidblack/jellyfin_ratings/blob/main/ratings.js) in the plugin window. Save and reload the page.
After installation, you may need to clear the cache. The cache for JMP is located at C:\Users\USERNAME\AppData\Local\Jellyfin Media Player\cache

![js](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/js.jpg)

# 3. Installation by modification index.html
First, in the web root you need to create a 'ratings' (/usr/share/jellyfin/web) folder and put a file in it ratings.js. Once you do that, to activate a just add the following to your 'index.html' just before the final `</body></html>` tags 

```html
<script src="ratings/ratings.js"></script>
```
After saving the changes, restart jellyfin

More examples
![2](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/2.jpg)
![3](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/3.jpg)
![4](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/4.jpg)
![5](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/5.jpg)
![6](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/6.jpg)
![7](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/7.jpg)
