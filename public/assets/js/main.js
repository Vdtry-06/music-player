const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'Trong_Player'
const player = $(".player");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Hư không",
      singer: "Kha",
      path: "./assets/music/HuKhong-Kha-1.mp3",
      image: "./assets/images/HuKhong-Kha-1.jpg",
    },
    {
      name: "Sau cơn mưa",
      singer: "Coolkids, Rhyder",
      path: "./assets/music/SauConMua-CoolkidsQuangAnhRhyder-2.mp3",
      image: "./assets/images/SauConMua-CoolkidsQuangAnhRhyder-2.jpg",
    },
    {
      name: "Từng Quen",
      singer: "Wren Evan",
      path: "./assets/music/TungQuen-WrenEvanItsnk-3.mp3", 
      image: "./assets/images/TungQuen-WrenEvanItsnk-3.jpg",
    },
    {
        name: "Nắng có mang em về",
        singer: "Shartnuss ft Tr.D & Phankeo",
        path: "./assets/music/NangCoMangEmVe-VA-4.mp3",
        image: "./assets/images/NangCoMangEmVe-VA-4.jpg",
    },
    {
      name: "Đừng về trễ nha",
      singer: "Sơn Tùng MTP",
      path: "./assets/music/DungVeTreAcousticVersion-MTP-2691583.mp3",
      image: "./assets/images/Dungvetrenha-SontungMTP.jpg",
    },
    {
      name: "Cuối cùng thì",
      singer: "J97 x Quanvrox",
      path: "./assets/music/CuoiCungThiLive-JackJ97-8462806.mp3",
      image: "./assets/images/cuoicungthi-j97.jpg",
    },
  ],
  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  // 1. Render Songs
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
                
            `;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  // 2. Scroll Top
  handeEvents: function () {
    _this = this;
    const cd = $(".cd");
    const cdWidth = cd.offsetWidth;

    // xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
        {transform: 'rotate(360deg)'}
    ], {
        duration: 15000, // 10 seconds
        iterations: Infinity
    })
    cdThumbAnimate.pause()
    // Xử lý phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop; // lấy tọa độ dọc
      const newCdWidth = cdWidth - scrollTop; // ẩn hoặc hiện khi kéo
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth; // làm mờ ảnh
    };

    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // khi bài hát được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play()
    };

    // khi bài hát bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause()
    };

    // khi tiến độ bài hát bị thay đổi
    audio.ontimeupdate = function () {
        if(audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercent
        }
    };

    // xử lý khi tua xong
    progress.onchange = function(e) {
        const seekTime = audio.duration / 100 * e.target.value
        audio.currentTime = seekTime
    };

    // khi prev song
    prevBtn.onclick = function() {
      if(_this.isRandom){
        _this.playRadomSong()
      } else {
        _this.prevSong()
      }
      audio.play()
    };

    // Khi next song
    nextBtn.onclick = function() {
      if(_this.isRandom){
        _this.playRadomSong()
      } else {
        _this.nextSong()
      }  
      audio.play()
      _this.render()
      _this.scrollToActiveSong()
    };

    // xử lý bật/tắt random song
    randomBtn.onclick = function() {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom)
    };

    // xử lý lặp lại 1 song
    repeatBtn.onclick = function() {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat)
    };

    // xử lý next song khi audio ended
    audio.onended = function() {
      if(_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)')
      if(songNode || e.target.closest('.option')) {
        // Xử lý khi click vào song
        if(songNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
        // Xử lý khi click vào song option
        if(e.target.closest('.option')) {

        }
      }
    }
  },
  scrollToActiveSong: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }, 300)
    
  },
  // 3. load bài hiện tại
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
    // console.log(heading, cdThumb, audio);
  },
  loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  prevSong: function() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong()
    this.render();
    this.scrollToActiveSong();
  },
  playRadomSong: function() {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while(newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  
  nextSong: function() {
    this.currentIndex++;
    if(this.currentIndex == this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong()
  },
  start: function () {

    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig()

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện(DOM events)
    this.handeEvents();
    // this.currentSong()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle('active', _this.isRandom)
    repeatBtn.classList.toggle('active', _this.isRepeat)
  },
};
app.start();
