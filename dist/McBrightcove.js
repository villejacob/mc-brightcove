(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global.McBrightcove = factory(global.$));
}(this, (function ($) { 'use strict';

$ = 'default' in $ ? $['default'] : $;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Observer = function () {
  function Observer() {
    classCallCheck(this, Observer);

    this.fns = [];
  }

  createClass(Observer, [{
    key: "subscribe",
    value: function subscribe(fn) {
      this.fns.push(fn);
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(fn) {
      this.fns = this.fns.filter(function (el) {
        if (el !== fn) {
          return el;
        }
      });
    }
  }, {
    key: "fire",
    value: function fire(o) {
      this.fns.forEach(function (el) {
        el(o);
      });
    }
  }]);
  return Observer;
}();

/* global bc */
/* global videojs */
var BrightcovePlayer = function () {
  function BrightcovePlayer() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$id = _ref.id,
        id = _ref$id === undefined ? 'brightcove-chapter-player' : _ref$id,
        _ref$theme = _ref.theme,
        theme = _ref$theme === undefined ? 'brightcove-default-theme' : _ref$theme,
        _ref$videoId = _ref.videoId,
        videoId = _ref$videoId === undefined ? '5399154124001' : _ref$videoId,
        _ref$endscreenContent = _ref.endscreenContent,
        endscreenContent = _ref$endscreenContent === undefined ? null : _ref$endscreenContent,
        _ref$controls = _ref.controls,
        controls = _ref$controls === undefined ? true : _ref$controls,
        _ref$autoplay = _ref.autoplay,
        autoplay = _ref$autoplay === undefined ? true : _ref$autoplay,
        _ref$muted = _ref.muted,
        muted = _ref$muted === undefined ? false : _ref$muted,
        _ref$onPlayerReady = _ref.onPlayerReady,
        onPlayerReady = _ref$onPlayerReady === undefined ? null : _ref$onPlayerReady;

    classCallCheck(this, BrightcovePlayer);

    this.id = id;
    this.theme = theme;
    this.videoId = videoId;
    this.controls = controls;
    this.autoplay = autoplay;
    this.muted = muted;
    this.endscreenContent = endscreenContent;
    this._hasEnded = false;
    this._currentTime = 0;

    this.onPlayerReady = onPlayerReady;
    this.onVideoReady = new Observer();
    this.onPlay = new Observer();
    this.onEnd = new Observer();
    this.onPause = new Observer();
    this.onTimeChange = new Observer();
    this.onError = new Observer();

    this.handlePlayerReady = this.handlePlayerReady.bind(this);
    this.startSecondsTimer = this.startSecondsTimer.bind(this);
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);

    this.init();
  }

  createClass(BrightcovePlayer, [{
    key: 'init',
    value: function init() {
      var $el = $('#' + this.id);
      var $player = $('<video\n      data-embed="default"\n      data-video-id=' + this.videoId + '\n      data-player-id="rkcQq7gAe"\n      data-account="5344802162001"\n      class="video-js mc-brightcove-player' + (' ' + this.theme) + '"\n      data-setup=\'{ "playbackRates": [0.5, 1, 1.5, 2] }\'\n      data-application-id\n      ' + (this.autoplay ? 'autoplay' : '') + '\n      ' + (this.muted ? 'muted' : '') + '\n      ' + (this.controls ? 'controls' : '') + '\n    ></video>');
      $el.addClass('mc-brightcove-player-wrapper');
      $el.append('<div style="padding-top: 56.25%"></div>');
      $el.eq(0).append($player);

      bc($player[0]);
      this.video = videojs($player[0]);
      this.video.ready(this.handlePlayerReady);
    }
  }, {
    key: 'handlePlayerReady',
    value: function handlePlayerReady(video) {
      var _this = this;

      if (this.endscreenContent) {
        this.video.customEndscreen({ content: this.endscreenContent });
      }

      this.video.on('play', this.playHandler.bind(this));
      this.video.on('pause', this.pauseHandler.bind(this));
      this.video.on('ended', this.endHandler.bind(this));
      this.video.on('loadedmetadata', function () {
        return _this.onVideoReady.fire(_this);
      });

      if (this.onPlayerReady) {
        this.onPlayerReady(this);
      }

      this.startSecondsTimer();

      if (this.playHasBeenRequested()) {
        this.play();
      }
    }
  }, {
    key: 'replaceWith',
    value: function replaceWith(videoId) {
      var _this2 = this;

      if (this.video.customOverlay) {
        this.video.customOverlay.close();
      }

      this.video.catalog.getVideo(videoId, function (error, video) {
        if (error) {
          _this2.onError.fire(error, _this2.video);
          return;
        }
        _this2.video.catalog.load(video);
        _this2._hasEnded = false;
        _this2._currentTime = 0;
        _this2.video.play();
      });
    }
  }, {
    key: 'play',
    value: function play() {
      if (this.videoIsLoaded()) {
        this.video.play();
      } else {
        this.requestPlay();
      }
    }
  }, {
    key: 'pause',
    value: function pause() {
      this.video.pause();
    }
  }, {
    key: 'time',
    value: function time(_time) {
      return this.video.currentTime(_time);
    }
  }, {
    key: 'duration',
    value: function duration() {
      if (this.videoIsLoaded()) {
        return this.video.duration();
      }
    }
  }, {
    key: 'requestPlay',
    value: function requestPlay() {
      this.playRequested = true;
      return this.playRequested;
    }
  }, {
    key: 'playHasBeenRequested',
    value: function playHasBeenRequested() {
      return this.playRequested === true;
    }
  }, {
    key: 'videoIsLoaded',
    value: function videoIsLoaded() {
      return this.video !== null && this.video !== undefined;
    }
  }, {
    key: 'playHandler',
    value: function playHandler() {
      if (this.video.customOverlay) {
        this.video.customOverlay.close();
      }
      this.onPlay.fire(this);
    }
  }, {
    key: 'pauseHandler',
    value: function pauseHandler() {
      this.onPause.fire(this);
    }
  }, {
    key: 'endHandler',
    value: function endHandler() {
      this._currentTime = 0;
      this._hasEnded = true;
      if (this.video.customOverlay) {
        this.video.customOverlay.open();
      }
      this.onEnd.fire(this);
    }
  }, {
    key: 'startSecondsTimer',
    value: function startSecondsTimer() {
      var _this3 = this;

      this.video.on('timeupdate', function () {
        var currentTime = Math.floor(_this3.video.currentTime());
        if (_this3._currentTime < currentTime) {
          _this3._currentTime = currentTime;
          _this3.onTimeChange.fire(currentTime);
        }
      });
    }
  }]);
  return BrightcovePlayer;
}();

return BrightcovePlayer;

})));
//# sourceMappingURL=McBrightcove.js.map
