const processor = {
  filterType: "UV",
  timerCallback() {
    if (this.video.paused || this.video.ended) {
      return;
    }
    this.computeFrame();
    setTimeout(() => {
      this.timerCallback();
    }, 16); // roughly 60 frames per second
  },

  doLoad() {
    this.video = document.getElementById("my-video");
    this.c1 = document.getElementById("my-canvas");
    this.ctx1 = this.c1.getContext("2d");

    this.video.addEventListener(
      "play",
      () => {
        this.width = this.video.width;
        this.height = this.video.height;
        this.timerCallback();
      },
      false
    );
  },

  computeFrame() {
    this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
    const frame = this.ctx1.getImageData(0, 0, this.width, this.height);
    const l = frame.data.length / 4;

    for (let i = 0; i < l; i++) {
      if (processor.filterType == "BW") {
        const grey =
          (frame.data[i * 4 + 0] +
            frame.data[i * 4 + 1] +
            frame.data[i * 4 + 2]) /
          3;

        frame.data[i * 4 + 0] = grey;
        frame.data[i * 4 + 1] = grey;
        frame.data[i * 4 + 2] = grey;
      } else if (processor.filterType == "UV") {
        if (
          frame.data[i * 4 + 0] > 120 &&
          frame.data[i * 4 + 1] < 100 &&
          frame.data[i * 4 + 2] < 100
        ) {
          frame.data[i * 4 + 2] = frame.data[i * 4 + 0];
          frame.data[i * 4 + 0] = 0;
          frame.data[i * 4 + 1] = 0;
        }
      } else if (processor.filterType == "RED2BLUE") {
        // let t = frame.data[i * 4 + 0];
        // frame.data[i * 4 + 0] = frame.data[i * 4 + 2];
        // frame.data[i * 4 + 2] = t;
        i = this.rgb2hsv(
          frame.data[i * 4 + 0],
          frame.data[i * 4 + 1],
          frame.data[i * 4 + 2]
        );
        //i[0] += 100;
        i = this.hsv2rgb(i[0], i[1], i[2]);
        frame.data[i * 4 + 0] = i[0];
        frame.data[i * 4 + 1] = i[1];
        frame.data[i * 4 + 2] = i[2];
      }
    }
    this.ctx1.putImageData(frame, 0, 0);

    return;
  },
  rgb2hsv(r, g, b) {
    let v = Math.max(r, g, b),
      n = v - Math.min(r, g, b);
    let h =
      n && (v == r ? (g - b) / n : v == g ? 2 + (b - r) / n : 4 + (r - g) / n);
    return [60 * (h < 0 ? h + 6 : h), v && n / v, v];
  },
  hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) =>
      v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
  },
};

function handleFilterClick(filterOption) {
  processor.filterType = filterOption.value;
  console.log("filterType: " + processor.filterType);
}

function init() {
  processor.doLoad();
  var vid = document.getElementById("my-video");
  vid.play();
}
