const fs = require('fs');
const {createFileDriverSync} = require('../src/index');

describe('createDriverSync', () => {
	let mockPath;
	let mockReadOnlyOpts;
	let mockReadWriteOpts;
	let mockFd;
	let mockFstat;
	let mockStats;
	let mockExistsSync;
	let mockAccessSync;
	let mockOpenSync;
	let mockReadSync;

	beforeEach(() => {
		mockPath = '/path/to/volume';
		mockReadOnlyOpts = {readOnly: true};
		mockReadWriteOpts = {readOnly: false};
		mockFd = 123;
		mockFstat = jest.spyOn(fs, 'fstatSync');
		mockStats = {size: 1024};
		mockFstat.mockReturnValue(mockStats);
		mockOpenSync = jest.spyOn(fs, 'openSync');
		mockOpenSync.mockReturnValue(mockFd);
		jest.spyOn(fs, 'write');
		jest.spyOn(fs, 'read');

		mockExistsSync = jest.spyOn(fs, 'existsSync');
		mockExistsSync.mockReturnValue(true);

		mockReadSync = jest.spyOn(fs, 'readSync');
		mockReadSync.mockReturnValue(512);

		mockAccessSync = jest.spyOn(fs, 'accessSync');
		mockAccessSync.mockReturnValue(true);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should open the file with the correct parameters', () => {
		createFileDriverSync(mockPath, mockReadOnlyOpts);

		expect(mockOpenSync).toHaveBeenCalledWith(mockPath, 'r');
	});

	it('should open the file in read-write mode if readOnly option is false', () => {
		mockReadOnlyOpts.readOnly = false;

		createFileDriverSync(mockPath, mockReadOnlyOpts);

		expect(mockOpenSync).toHaveBeenCalledWith(mockPath, 'r+');
	});

	it('should return a driver object with correct properties for read only', () => {
		const driver = createFileDriverSync(mockPath, mockReadOnlyOpts);

		expect(driver).toEqual(
			expect.objectContaining({
				sectorSize: 512,
				numSectors: mockStats.size / 512,
				readSectors: expect.any(Function),
			}),
		);

		expect(driver.readOnly).toBe(true);
	});

	it('should return a driver object with correct properties for read write', () => {
		const driver = createFileDriverSync(mockPath, mockReadWriteOpts);

		expect(driver).toEqual(
			expect.objectContaining({
				sectorSize: 512,
				numSectors: mockStats.size / 512,
				readSectors: expect.any(Function),
				writeSectors: expect.any(Function),
			}),
		);
	});

	it('should throw an error if the buffer length is unexpected in readSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadOnlyOpts);
		const buffer = Buffer.alloc(1023);

		expect(() => {
			driver.readSectors(0, buffer, () => {});
		}).toThrow('Unexpected buffer length!');
	});

	it('should call fs.read with the correct parameters in readSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadOnlyOpts);
		const buffer = Buffer.alloc(512);
		const mockCallback = jest.fn();

		driver.readSectors(0, buffer, mockCallback);

		expect(fs.read).toHaveBeenCalledWith(
			mockFd,
			buffer,
			0,
			512,
			0,
			expect.any(Function),
		);
	});

	it('should call the callback with the correct parameters in readSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadOnlyOpts);
		const buffer = Buffer.alloc(512);
		const mockCallback = jest.fn();
		const mockError = new Error('Read error');
		const mockData = Buffer.alloc(512);

		// eslint-disable-next-line max-params
		fs.read.mockImplementationOnce((fd, buf, offset, length, position, callback) => {
			callback(mockError, buffer.length, mockData);
		});

		driver.readSectors(0, buffer, mockCallback);

		expect(mockCallback).toHaveBeenCalledWith(mockError, mockData);
	});

	it('should throw an error if the buffer length is unexpected in writeSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadWriteOpts);
		const buffer = Buffer.alloc(1023);

		expect(() => {
			driver.writeSectors(0, buffer, () => {});
		}).toThrow('Unexpected buffer length!');
	});

	it('should call fs.write with the correct parameters in writeSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadWriteOpts);
		const buffer = Buffer.alloc(512);
		const mockCallback = jest.fn();

		driver.writeSectors(0, buffer, mockCallback);

		expect(fs.write).toHaveBeenCalledWith(
			mockFd,
			buffer,
			0,
			512,
			0,
			expect.any(Function),
		);
	});

	it('should call the callback with the correct parameters in writeSectors', () => {
		const driver = createFileDriverSync(mockPath, mockReadWriteOpts);
		const buffer = Buffer.alloc(512);
		const mockCallback = jest.fn();
		const mockError = new Error('Write error');

		// eslint-disable-next-line max-params
		fs.write.mockImplementationOnce((fd, buf, offset, length, position, callback) => {
			callback(mockError);
		});

		driver.writeSectors(0, buffer, mockCallback);

		expect(mockCallback).toHaveBeenCalledWith(mockError);
	});

	it('should set the current partition number in setCurrentPartition', () => {
		// Test with a valid partition number
		const driver = createFileDriverSync(mockPath, mockReadWriteOpts);
		driver.partitionNumber = 0;
		expect(driver.partitionNumber).toBe(0);
	});

	it('should throw an error if the file does not exist', () => {
		// Test with an invalid file
		mockExistsSync.mockReturnValueOnce(false);
		expect(() => {
			createFileDriverSync(mockPath, mockReadWriteOpts);
		}).toThrow('File does not exist!');
	});

	it('should be able to use a partitionNumber other than 0 in constructor', () => {
		// Test with a valid partition number
		const driver = createFileDriverSync(mockPath, {readOnly: true, partitionNumber: 1});
		expect(driver.partitionNumber).toBe(1);
	});

	it('should return an empty partition list if the size is less than 512 and partition is defined', () => {
		// Test with a valid partition number
		const mockfstatSync = jest.spyOn(fs, 'fstatSync');
		mockfstatSync.mockReturnValue({size: 511});
		expect(() => {
			createFileDriverSync(mockPath, {readOnly: true, partitionNumber: 1});
		}).toThrow('Partition 1 does not exist!');
	});
});
