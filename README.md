# infinite-circle

[![Build Status](https://travis-ci.org/mjancarik/infinite-circle.svg?branch=master)](https://travis-ci.org/mjancarik/infinite-circle) [![dependencies Status](https://david-dm.org/mjancarik/infinite-circle/status.svg)](https://david-dm.org/mjancarik/infinite-circle)
[![Coverage Status](https://coveralls.io/repos/github/mjancarik/infinite-circle/badge.svg?branch=master)](https://coveralls.io/github/mjancarik/infinite-circle?branch=master)
![GitHub package version](https://img.shields.io/github/package-json/v/mjancarik/infinite-circle.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The utility for synchronising reading and writing operation in browser. The infinite is a smart and automatic on and off loop for saving resources. It's use full for reading a writing operation on DOM which may normally cause layout thrashing.

## Installation

```
npm i infinite-circle --save
```

## Usage

```javascript
import { Circle, Infinite } from 'infinite-circle';

// defined action which cause running read and write operation
let visibilityCircle = new Circle({
    listen: notify => {
        window.addEventListener('scroll', notify);
        window.addEventListener('resize', notify);
    },
    unlisten: notify => {
        window.removeEventListener('scroll', notify);
        window.removeEventListener('resize', notify);
    }
});

// defined read and write operation
const img1 = document.querySelector('.img1');
let img1CircleId = visibilityCircle.register({
    read: () => {
        let rect = img1.getBoundingClientRect();

        return intersectionPercentage(rect);
    },
    write({ payload }) => {
        if (payload > 0) {
            loadImage(img1);
            visibilityCircle.unregister(img1CircleId);
        }
    }
});
// register more elements

// register circle to synchronising infinite loop
let infinite = new Infinite();
infinite.add(visibilityCircle);

// other functions
function intersectionPercentage(rect) {
    .
    .
    .
    return percent;
}

function loadImage(imageElement) {
    .
    .
    .
}
```
