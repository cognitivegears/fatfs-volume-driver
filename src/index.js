const VolumeDriverBuffer = require('./volumeDriver/VolumeDriverBuffer');
const VolumeDriverFile = require('./volumeDriver/VolumeDriverFile');

exports.createBufferDriverSync = function (path, opts = {}) {
	return new VolumeDriverBuffer(path, opts);
};

exports.createFileDriverSync = function (path, opts = {}) {
	return new VolumeDriverFile(path, opts);
};
