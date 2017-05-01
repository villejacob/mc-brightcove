/* global bc */
/* global videojs */
import Observer from './Observer'
import $ from 'jquery'

export default class BrightcovePlayer {
  constructor ({
    id = 'brightcove-chapter-player',
    theme = 'brightcove-default-theme',
    videoId = '5399154124001',
    endscreenContent = null,
    controls = true,
    autoplay = true,
    muted = false,
    onPlayerReady = null
  } = {}) {
    this.id = id
    this.theme = theme
    this.videoId = videoId
    this.controls = controls
    this.autoplay = autoplay
    this.muted = muted
    this.endscreenContent = endscreenContent
    this._hasEnded = false
    this._currentTime = 0

    this.onPlayerReady = onPlayerReady
    this.onVideoReady = new Observer()
    this.onPlay = new Observer()
    this.onEnd = new Observer()
    this.onPause = new Observer()
    this.onTimeChange = new Observer()
    this.onError = new Observer()

    this.handlePlayerReady = this.handlePlayerReady.bind(this)
    this.startSecondsTimer = this.startSecondsTimer.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)

    this.init()
  }

  init () {
    let $el = $(`#${this.id}`)
    let $player = $(`<video
      data-embed="default"
      data-video-id=${this.videoId}
      data-player-id="rkcQq7gAe"
      data-account="5344802162001"
      class="video-js mc-brightcove-player${' ' + this.theme}"
      data-setup='{ "playbackRates": [0.5, 1, 1.5, 2] }'
      data-application-id
      ${this.autoplay ? 'autoplay' : ''}
      ${this.muted ? 'muted' : ''}
      ${this.controls ? 'controls' : ''}
    ></video>`)
    $el.css({
      display: 'block',
      position: 'relative',
      overflow: 'hidden'
    })
    $el.append('<div style="padding-top: 56.25%"></div>')
    $el.eq(0).append($player)

    bc($player[0])
    this.video = videojs($player[0])
    this.video.ready(this.handlePlayerReady)
  }

  handlePlayerReady (video) {
    if (this.endscreenContent) {
      this.video.customEndscreen({ content: this.endscreenContent })
    }

    this.video.on('play', this.playHandler.bind(this))
    this.video.on('pause', this.pauseHandler.bind(this))
    this.video.on('ended', this.endHandler.bind(this))
    this.video.on('loadedmetadata', () => this.onVideoReady.fire(this))

    if (this.onPlayerReady) {
      this.onPlayerReady(this)
    }

    this.startSecondsTimer()

    if (this.playHasBeenRequested()) {
      this.play()
    }
  }

  replaceWith (videoId) {
    if (this.video.customOverlay) {
      this.video.customOverlay.close()
    }

    this.video.catalog.getVideo(videoId, (error, video) => {
      if (error) {
        this.onError.fire(error, this.video)
        return
      }
      this.video.catalog.load(video)
      this._hasEnded = false
      this._currentTime = 0
      this.video.play()
    })
  }

  play () {
    if (this.videoIsLoaded()) {
      this.video.play()
    } else {
      this.requestPlay()
    }
  }

  pause () {
    this.video.pause()
  }

  time (time) {
    return this.video.currentTime(time)
  }

  duration () {
    if (this.videoIsLoaded()) {
      return this.video.duration()
    }
  }

  requestPlay () {
    this.playRequested = true
    return this.playRequested
  }

  playHasBeenRequested () {
    return this.playRequested === true
  }

  videoIsLoaded () {
    return this.video !== null && this.video !== undefined
  }

  playHandler () {
    this.onPlay.fire(this)
  }

  pauseHandler () {
    this.onPause.fire(this)
  }

  endHandler () {
    this._currentTime = 0
    this._hasEnded = true
    if (this.video.customOverlay) {
      this.video.customOverlay.open()
    }
    this.onEnd.fire(this)
  }

  startSecondsTimer () {
    this.video.on('timeupdate', () => {
      let currentTime = Math.floor(this.video.currentTime())
      if (this._currentTime < currentTime) {
        this._currentTime = currentTime
        this.onTimeChange.fire(currentTime)
      }
    })
  }
}
