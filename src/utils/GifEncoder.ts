/**
 * 简易 GIF 编码器（基于 LZW 压缩）
 * 支持 256 色调色板，逐帧添加
 */
export class GifEncoder {
  private width: number;
  private height: number;
  private delay: number; // 帧延迟（1/100秒）
  private frames: Uint8Array[] = [];
  private globalPalette: number[] = [];

  constructor(width: number, height: number, delay = 5) {
    this.width = width;
    this.height = height;
    this.delay = delay;
  }

  /** 从 canvas 添加一帧 */
  addFrame(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const pixels = imageData.data;

    // 量化为 256 色（中位切分简化版：均匀采样）
    const { palette, indexed } = this.quantize(pixels);

    if (this.frames.length === 0) {
      this.globalPalette = palette;
    }

    this.frames.push(indexed);
  }

  /** 导出 GIF 二进制 */
  encode(): Blob {
    const buf: number[] = [];

    // GIF Header
    this.writeString(buf, 'GIF89a');

    // Logical Screen Descriptor
    this.writeU16(buf, this.width);
    this.writeU16(buf, this.height);
    buf.push(0xF7); // GCT flag, 256 colors (2^(7+1))
    buf.push(0);    // bg color index
    buf.push(0);    // pixel aspect ratio

    // Global Color Table (256 * 3 bytes)
    for (let i = 0; i < 256; i++) {
      const c = this.globalPalette[i] || 0;
      buf.push((c >> 16) & 0xFF); // R
      buf.push((c >> 8) & 0xFF);  // G
      buf.push(c & 0xFF);         // B
    }

    // Netscape Extension (循环播放)
    buf.push(0x21, 0xFF, 0x0B);
    this.writeString(buf, 'NETSCAPE2.0');
    buf.push(0x03, 0x01);
    this.writeU16(buf, 0); // 无限循环
    buf.push(0x00);

    // 逐帧写入
    for (const indexed of this.frames) {
      // Graphic Control Extension
      buf.push(0x21, 0xF9, 0x04);
      buf.push(0x00); // disposal method
      this.writeU16(buf, this.delay);
      buf.push(0x00); // transparent color index (none)
      buf.push(0x00);

      // Image Descriptor
      buf.push(0x2C);
      this.writeU16(buf, 0); // left
      this.writeU16(buf, 0); // top
      this.writeU16(buf, this.width);
      this.writeU16(buf, this.height);
      buf.push(0x00); // no local color table

      // LZW 编码
      this.writeLZW(buf, indexed, 8);
    }

    // Trailer
    buf.push(0x3B);

    return new Blob([new Uint8Array(buf)], { type: 'image/gif' });
  }

  /** 简易颜色量化：均匀量化到 256 色 */
  private quantize(pixels: Uint8ClampedArray): { palette: number[]; indexed: Uint8Array } {
    const palette: number[] = [];
    const colorMap = new Map<number, number>();
    const indexed = new Uint8Array(this.width * this.height);

    for (let i = 0; i < pixels.length; i += 4) {
      // 量化：每通道保留高 5 位（32 级 = 32768 色 → 映射到 256）
      const r = pixels[i] & 0xE0;
      const g = pixels[i + 1] & 0xE0;
      const b = pixels[i + 2] & 0xE0;
      const key = (r << 16) | (g << 8) | b;

      let idx = colorMap.get(key);
      if (idx === undefined) {
        if (palette.length < 256) {
          idx = palette.length;
          palette.push((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
          colorMap.set(key, idx);
        } else {
          // 超过 256 色，找最近的
          idx = this.findClosest(palette, pixels[i], pixels[i + 1], pixels[i + 2]);
          colorMap.set(key, idx);
        }
      }
      indexed[i / 4] = idx;
    }

    // 填充到 256 色
    while (palette.length < 256) palette.push(0);

    return { palette, indexed };
  }

  private findClosest(palette: number[], r: number, g: number, b: number): number {
    let minDist = Infinity;
    let minIdx = 0;
    for (let i = 0; i < palette.length; i++) {
      const pr = (palette[i] >> 16) & 0xFF;
      const pg = (palette[i] >> 8) & 0xFF;
      const pb = palette[i] & 0xFF;
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < minDist) {
        minDist = dist;
        minIdx = i;
      }
    }
    return minIdx;
  }

  /** LZW 压缩写入 */
  private writeLZW(buf: number[], indexed: Uint8Array, minCodeSize: number): void {
    buf.push(minCodeSize);

    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const maxCode = 4096;

    // 子块缓冲
    const subBuf: number[] = [];
    let bitBuf = 0;
    let bitCount = 0;

    const writeBits = (code: number, size: number) => {
      bitBuf |= code << bitCount;
      bitCount += size;
      while (bitCount >= 8) {
        subBuf.push(bitBuf & 0xFF);
        bitBuf >>= 8;
        bitCount -= 8;
      }
    };

    // 初始化字典
    let dict = new Map<string, number>();
    const resetDict = () => {
      dict = new Map();
      for (let i = 0; i < clearCode; i++) {
        dict.set(String(i), i);
      }
      codeSize = minCodeSize + 1;
      nextCode = eoiCode + 1;
    };

    writeBits(clearCode, codeSize);
    resetDict();

    let current = String(indexed[0]);
    for (let i = 1; i < indexed.length; i++) {
      const next = String(indexed[i]);
      const combined = current + ',' + next;

      if (dict.has(combined)) {
        current = combined;
      } else {
        writeBits(dict.get(current)!, codeSize);

        if (nextCode < maxCode) {
          dict.set(combined, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeBits(clearCode, codeSize);
          resetDict();
        }
        current = next;
      }
    }

    writeBits(dict.get(current)!, codeSize);
    writeBits(eoiCode, codeSize);

    // 刷新剩余位
    if (bitCount > 0) {
      subBuf.push(bitBuf & 0xFF);
    }

    // 写入子块（每块最多 255 字节）
    let offset = 0;
    while (offset < subBuf.length) {
      const chunkSize = Math.min(255, subBuf.length - offset);
      buf.push(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        buf.push(subBuf[offset + i]);
      }
      offset += chunkSize;
    }

    buf.push(0x00); // block terminator
  }

  private writeU16(buf: number[], val: number): void {
    buf.push(val & 0xFF, (val >> 8) & 0xFF);
  }

  private writeString(buf: number[], str: string): void {
    for (let i = 0; i < str.length; i++) {
      buf.push(str.charCodeAt(i));
    }
  }
}
