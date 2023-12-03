# fatfs-volume-driver

## Overview

`fatfs-volume-driver` is a Node.js library designed to provide default implementations of a volume driver for the excellent [fatfs](https://github.com/natevw/fatfs) library. A "Volume Driver" API is needed to use that library. While an example is provided, this library contains a more complete example, including a file-based driver as well as one that operates on Node.js [Buffer](https://nodejs.org/api/buffer.html).

## Requirements

* [Node.js](https://nodejs.org) (currently tested with versions 16.x and 18.x).
* [fatfs](https://github.com/natevw/fatfs) - this library provides volume drivers for the fatfs library

## Installation

Install the package via npm:

```bash
npm install fatfs-volume-driver
```

## Usage

Here's a simple example with the file interface to get you started:

```javascript
const fatfs = require('fatfs');
const {createFileDriverSync} = require('fatfs-volume-driver');

const driver = createFileDriverSync('/path/to/file.img', {partitionNumber: 1, readOnly: false});

const ffs = fatfs.createFileSystem(driver);

// Use ffs like a fs object.

```

and another example using a buffer:

```javascript
const fatfs = require('fatfs');
const {createBufferDriverSync} = require('fatfs-volume-driver');

const imgBuffer = ... // code to get your image data in a Buffer

const driver = createBufferDriverSync('', {buffer: imgBuffer, partitionNumber: 1, readOnly: false});

const ffs = fatfs.createFileSystem(driver);

// Use ffs like a fs object.

```


## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute to the development of `fatfs-volume-driver`.

## License

This project is licensed under the BSD 2-clause license. See the [LICENSE](LICENSE) file for details.
