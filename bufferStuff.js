/*
	===========- bufferStuff.js -===========
	  Created by Holly (tgpethan) (c) 2022
	  Licenced under MIT
	========================================
*/

module.exports.Writer = class {
	// bufferStuff supports pre-allocating memory for the buffer
	// if you pass in a size of 0 then it will just dynamicly allocate at the
	// cost of performance

	// NOTE: In pre-allocation mode if you exceed the size of the buffer
	// 		 that you set it will cause a crash.
	constructor(size = 0) {
		this.buffer = Buffer.alloc(size);
		this.offset = 0;
		this.baseSize = size;
	}

	reset() {
		this.buffer = Buffer.alloc(this.baseSize);
		this.offset = 0;
		return this;
	}

	writeBuffer(buff = Buffer.alloc(0)) {
		this.buffer = Buffer.concat([this.buffer, buff], this.buffer.length + buff.length);
		return this;
	}

	writeBool(data = false) {
		this.writeUInt(data ? 1 : 0);
		return this;
	}

	// NOTE: Currently writing a nibble requires you to write both halves at the same time.
	writeNibble(nibble1 = 0, nibble2 = 0) {
		this.writeUByte(nibble1 | (nibble2 << 4));
		return this;
	}

	writeByte(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(1);
			buff.writeInt8(data, 0);
	
			this.writeBuffer(buff);
		} else {
			this.buffer.writeInt8(data, this.offset);
			this.offset += 1;
		}
		return this;
	}

	writeUByte(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(1);
			buff.writeUInt8(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeUInt8(data, this.offset);
			this.offset += 1;
		}
		return this;
	}

	writeByteArray(data = [0]) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(data.length);

			for (let byte of data) {
				buff.writeInt8(byte);
			}

			this.writeBuffer(buff);
		} else {
			for (let byte of data) {
				this.buffer.writeInt8(byte);
				this.offset += 1;
			}
		}
		return this;
	}

	writeShort(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(2);
			buff.writeIntLE(data, 0, 2);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeIntLE(data, this.offset, 2);
			this.offset += 2;
		}
		return this;
	}

	writeUShort(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(2);
			buff.writeUIntLE(data, 0, 2);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeUIntLE(data, this.offset, 2);
			this.offset += 2;
		}
		return this;
	}

	writeShortArray(data = [0]) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(data.length * 2);
			let offset = 0;

			for (let short of data) {
				buff.writeIntLE(short, offset, 2);
				offset += 2;
			}

			this.writeBuffer(buff);
		} else {
			for (let short of data) {
				this.buffer.writeIntLE(short, this.offset, 2);
				this.offset += 2;
			}
		}
		return this;
	}

	writeInt(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(4);
			buff.writeIntLE(data, 0, 4);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeIntLE(data, this.offset, 4);
			this.offset += 4;
		}
		return this;
	}

	writeUInt(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(4);
			buff.writeUIntLE(data, 0, 4);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeUIntLE(data, this.offset, 4);
			this.offset += 4;
		}
		return this;
	}

	writeLong(data = 0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(8);
			if (data instanceof BigInt) buff.writeBigInt64LE(data, 0);
			else buff.writeBigInt64LE(BigInt(data), 0);

			this.writeBuffer(buff);
		} else {
			if (data instanceof BigInt) this.buffer.writeBigInt64LE(data, this.offset);
			else this.buffer.writeBigInt64LE(BigInt(data), this.offset);
			this.offset += 8;
		}
		return this;
	}

	writeFloat(data = 0.0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(4);
			buff.writeFloatLE(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeFloatLE(data, this.offset);
			this.offset += 4;
		}
		return this;
	}

	writeDouble(data = 0.0) {
		if (this.baseSize == 0) {
			const buff = Buffer.alloc(8);
			buff.writeDoubleLE(data, 0);

			this.writeBuffer(buff);
		} else {
			this.buffer.writeDoubleLE(data, this.offset);
			this.offset += 8;
		}
		return this;
	}

	writeString(string = "") {
		this.writeUShort(string.length);

		for (let i = 0; i < string.length; i++) {
			this.writeUShort(string.charCodeAt(i));
		}
		return this;
	}
}

module.exports.Reader = class {
	constructor(buffer = Buffer.alloc(0)) {
		this.buffer = buffer;
		this.offset = 0;
	}

	readBool() {
		return this.readUInt() == 0x01 ? true : false;
	}

	readByte() {
		const data = this.buffer.readInt8(this.offset);
		this.offset += 1;
		return data;
	}

	readUByte() {
		const data = this.buffer.readUInt8(this.offset);
		this.offset += 1;
		return data;
	}

	skipByte() {
		this.offset += 1;
	}

	readShort() {
		const data = this.buffer.readIntLE(this.offset, 2);
		this.offset += 2;
		return data;
	}

	skipShort() {
		this.offset += 2;
	}

	readUInt() {
		const data = this.buffer.readUIntLE(this.offset, 4);
		this.offset += 4;
		return data;
	}

	readInt() {
		const data = this.buffer.readIntLE(this.offset, 4);
		this.offset += 4;
		return data;
	}

	skipInt() {
		this.offset += 4;
	}

	skipUInt128() {
		this.offset += 16;
	}

	readLong() {
		const data = this.buffer.readBigInt64LE(this.offset);
		this.offset += 8;
		return data;
	}

	readULong() {
		const data = this.buffer.readBigUInt64LE(this.offset);
		this.offset += 8;
		return data;
	}

	skipLong() {
		this.offset += 8;
	}

	readFloat() {
		const data = this.buffer.readFloatLE(this.offset);
		this.offset += 4;
		return data;
	}

	skipFloat() {
		this.offset += 4;
	}

	readDouble() {
		const data = this.buffer.readDoubleLE(this.offset);
		this.offset += 8;
		return data;
	}

	skipDouble() {
		this.offset += 8;
	}

	readChars(count = 1, hash = false) {
		let data = "";

		if (hash) data += "0x";

		for (let i = 0; i < count; i++) {
			if (hash) data += this.readByte();
			else data += String.fromCharCode(this.readByte());
		}

		if (hash) return parseInt(data);
		else return data;
	}

	readString() {
		const length = this.readUInt();
		let data = "";

		for (let i = 0; i < length; i++) {
			data += String.fromCharCode(this.readByte());
		}

		return data;
	}

	skipString() {
		const length = this.readShort();

		this.offset += length;
	}
}