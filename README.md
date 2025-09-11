# 🔥 Jellyfin ratings V2🔥
**Corrections have been made only to the conversion, which I recommend to install through the JavaScript Injector Plugin**

**Differences between the second version and the first:**

1. Getting more ratings and additional certifications from Metacritic and Rottentomates sites

2. Due to additional data sources, the data takes a little longer to load than in the first version.

3. Due to technical limitations, the code that integrates into the jellyfin page has a number of limitations. Such as unstable downloading of additional ratings from AlloCiné, Douban sites and obtaining certificates from Metacritic and Rottentomates sites. This is due to the use of free proxy servers.

4. Additional ratings (AniList, Kinopoisk, AlloCiné, Douban) will be uploaded only if the title and release year are found on the websites. Otherwise, there will be no data.  This is done to avoid receiving erroneous data.

![logo2](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/logo_v2.png)

Replaces jellyfish ratings with ratings from various sources IMDb, Trakt, Imdb, Letterboxd, Tomato, Popcorn, Metacritic, RogerEbert, and MyAnimeList, AniList, Kinopoisk, AlloCiné, Douban and certificates with Metacritic and Rottentomatoes
To get ratings, you must have a plugin for getting data from TMDB and an ID.

Example

![1_v2](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/2_v2.jpg))

# 📌 Installation 📌

Before starting the installation, you need to get an API key on the site [mdblist.com](https://mdblist.com/preferences) and [kinopoiskapiunofficial.tech](kinopoiskapiunofficial.tech) (Not necessarily)

# 1. Installation on a single browser using third-party programs (It will only work in the browser in which you install the script)

To use these userscripts, you need a userscript add-on or extension such as [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), or [Greasemonkey](https://addons.mozilla.org/en-GB/firefox/addon/greasemonkey/) installed in your browser. More information can be found [here](https://stackapps.com/tags/script/info), [here](https://openuserjs.org/about/Userscript-Beginners-HOWTO), or [here](https://userscripts-mirror.org/about/installing.html).

[![Source](https://github.com/Druidblack/MusicBrainz-UserScripts/blob/main/add/Source-button.png)](https://github.com/Druidblack/jellyfin_ratings/blob/main/jellyfin_ratings_v2.user.js)
[![Install](https://github.com/Druidblack/MusicBrainz-UserScripts/blob/main/add/Install-button.png)](https://github.com/Druidblack/jellyfin_ratings/raw/main/jellyfin_ratings_v2.user.js)

# 2. Plug-in installation (it will work wherever the web interface is used)
***This is the most convenient installation method.***
With this installation, obtaining a certificate from the Metacritic website will not work, and obtaining Rottentomates certificates and ratings from the AlloCiné and Douban websites may be unstable. This is due to the limitations of the free proxy servers that are used to receive the data.

Install the plugin [JavaScript Injector Plugin](https://github.com/n00bcodr/Jellyfin-JavaScript-Injector)

Copy the contents of the file [ratings.js](https://github.com/Druidblack/jellyfin_ratings/blob/main/jellyfin_ratings_v2.js) in the plugin window. Save and reload the page.
After installation, you may need to clear the cache. The cache for JMP is located at C:\Users\USERNAME\AppData\Local\Jellyfin Media Player\cache

![js](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/jss.jpg)

# 3. Installation by modification index.html
First, in the web root you need to create a 'ratings' (/usr/share/jellyfin/web) folder and put a file in it ratings.js. Once you do that, to activate a just add the following to your 'index.html' just before the final `</body></html>` tags 

```html
<script src="ratings/jellyfin_ratings_v2.js"></script>
```
After saving the changes, restart jellyfin

More examples
![11](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/1_v2.jpg)
![12](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/2_v2.jpg)
![13](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/3_v2.jpg)
![14](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/4_v2.jpg)
![15](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/5_v2.jpg)



# 🔥 Jellyfin ratings V1🔥

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

![js](https://github.com/Druidblack/jellyfin_ratings/blob/main/img/jss.jpg)

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
