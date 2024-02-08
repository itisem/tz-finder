# tz-finder

**tz-finder** is a light-weight, fast and highly customisable library to get the timezone from any given coordinates. It has full Typescript support, works in the browser, and can be re-generated with newer data at any time.

## Data sources

tz-finder uses data from Evan Siroky's [Timezone Boundary Builder](https://github.com/evansiroky/timezone-boundary-builder) project. In particular, this library uses the version with all timezones, including ocean borders. This data is then compressed to an accuracy of [zoom level](https://wiki.openstreetmap.org/wiki/Zoom_levels) 9, which corresponds to an accuracy no worse than 300 metres.

By default, the current version of library ships with the **2023d** dataset which was updated on 29 December 2023. If this data is too old, or you want to tinker with the settings, see below for how to regenerate the datasets.

## Usage

Using this library is extremely simple:

```js
import lookup from "tz-finder";
lookup(16.92529, -92.76128); // "America/Mexico_City"
````

*Note: this library may provide an inaccurate result under rare circumstances as it trades speed for accuracy. See the comparison section for details.*

### Regenerating the dataset

In certain use cases, you may wish to regenerate the dataset. For instance, if you are shipping the library directly in browsers, it may be worth sacrificing some degree of accuracy, or old timezones that haven't existed for a long while. If so, follow these steps:

* Install the following packages: `npm i adm-zip @turf/bbox @turf/boolean-point-in-polygon @turf/helpers`. The library doesn't ship with these optional dependencies to ensure compactness, since for most users, regenerating the dataset is not required.
* Run `refresh/index.ts`

## Comparison with other libraries

**tz-finder** is a middle ground between the small, but inaccurate @photostructure/tz-lookup, and the large, but accurate geo-tz library:

| Library                         | Accuracy | Lookups / second | Database size |
| ------------------------------- | -------: | ---------------: | ------------: |
| **tz-finder**                   |  91.83%  |  557103          | 83.4kB        |
| **geo-tz** / **browser-geo-tz** | 100.00%  |  289771          | 65.5MB        |
| **@photostructure/tz-lookup**   |  67.49%  | 7194244          | 71.6kB        |

*(results based on 1 million randomly generated coordinates on my i5-11400F)*

In other words:

* use **geo-tz** if accuracy is crucial, and you are only running code on the server-side
* use **@photostructure/tz-lookup** if you only want estimates, but you want them fast
* use **tz-finder** if you don't mind trading off some speed for much better accuracy