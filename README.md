# tz-finder

**tz-finder** is a light-weight, fast and highly customisable library to get the timezone from any given coordinates. It has full Typescript support, works in the browser, and can be re-generated with newer data at any time.

## Data sources

tz-finder uses data from Evan Siroky's [Timezone Boundary Builder](https://github.com/evansiroky/timezone-boundary-builder) project. In particular, this library uses the version with all timezones, including ocean borders. This data is then compressed to an accuracy of [zoom level](https://wiki.openstreetmap.org/wiki/Zoom_levels) 9, which corresponds to an accuracy no worse than 300 metres.

By default, the current version of library ships with the **2023d** dataset which was updated on 29 December 2023. If this data is too old, or you want to tinker with the settings, see below for how to regenerate the datasets.

### Accuracy

## Usage

Using this library is extremely simple:

```js
import lookup from "tz-finder";
lookup(16.92529, -92.76128); // "America/Mexico_City"
````

### Regenerating the dataset

In certain use cases, you may wish to regenerate the dataset. For instance, if you are shipping the library directly in browsers, it may be worth sacrificing some degree of accuracy, or old timezones that haven't existed for a long while. If so, follow these steps:

* Install the following packages: `npm i adm-zip minimist @turf/bbox @turf/boolean-point-in-polygon @turf/helpers`. The library doesn't ship with these optional dependencies to ensure compactness, since for most users, regenerating the dataset is not required.
* Run `refresh/index.ts`

## Comparison
