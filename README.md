# infinite-circle

The utility for synchronising reading and writing operation in browser. The infinite is a smart and automatic on and off loop for saving resources. It's useful for reading and writing operations on the DOM which may normally cause layout thrashing.

## Installation

```
npm i infinite-circle --save
```

## Usage

```javascript
import { Circle, Infinite } from 'infinite-circle';

// Define actions which cause running read and write operation
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

// Define read and write operation
const img1 = document.querySelector('.img1');
let img1CircleId = visibilityCircle.register({
    read: () => {
        let rect = img1.getBoundingClientRect();
        return intersectionPercentage(rect);
    },
    write({ payload }) {
        if (payload > 0) {
            loadImage(img1);
            visibilityCircle.unregister(img1CircleId);
        }
    },
    meta: { interval: 180 } // Optional, default 180
});
// Register more elements as needed

// Register circle to synchronise infinite loop
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

---

## Public API

### Circle

- **constructor({ listen, unlisten, filter, execute })**
  - `listen(notify)`: Function to start listening for events (e.g., addEventListener). Optional.
  - `unlisten(notify)`: Function to stop listening for events. Optional.
  - `filter(entry, args)`: Optional filter function for entries.
  - `execute(...args)`: Optional custom execution logic.

- **register({ read, write, meta })**: Register an entry with `read` and `write` methods and optional `meta` (e.g., `{ interval: 180 }`). Returns an entry ID.
- **unregister(id)**: Remove an entry by ID.
- **getEntries()**: Get all registered entries as a Map.
- **subscribe(listener)**: Subscribe to notifications. `listener` is called with arguments passed to `notify`.
- **notify(...args)**: Notify all observers with the provided arguments.

### Infinite

- **constructor()**: Create a new Infinite instance.
- **add(circle)**: Add a `Circle` instance to be managed.
- **remove(circle)**: Remove a `Circle` instance.

---
