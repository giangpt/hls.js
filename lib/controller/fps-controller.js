'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * FPS Controller
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _events = require('../events');

var _events2 = _interopRequireDefault(_events);

var _logger = require('../utils/logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FPSController = function () {
  function FPSController(hls) {
    _classCallCheck(this, FPSController);

    this.hls = hls;
    this.timer = setInterval(this.checkFPS, hls.config.fpsDroppedMonitoringPeriod);
  }

  _createClass(FPSController, [{
    key: 'destroy',
    value: function destroy() {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  }, {
    key: 'checkFPS',
    value: function checkFPS() {
      var v = this.hls.video;
      if (v) {
        var decodedFrames = v.webkitDecodedFrameCount,
            droppedFrames = v.webkitDroppedFrameCount,
            currentTime = new Date();
        if (decodedFrames) {
          if (this.lastTime) {
            var currentPeriod = currentTime - this.lastTime;
            var currentDropped = droppedFrames - this.lastDroppedFrames;
            var currentDecoded = decodedFrames - this.lastDecodedFrames;
            var decodedFPS = 1000 * currentDecoded / currentPeriod;
            var droppedFPS = 1000 * currentDropped / currentPeriod;
            if (droppedFPS > 0) {
              _logger.logger.log('checkFPS : droppedFPS/decodedFPS:' + droppedFPS.toFixed(1) + '/' + decodedFPS.toFixed(1));
              if (currentDropped > this.hls.config.fpsDroppedMonitoringThreshold * currentDecoded) {
                _logger.logger.warn('drop FPS ratio greater than max allowed value');
                this.hls.trigger(_events2.default.FPS_DROP, { currentDropped: currentDropped, currentDecoded: currentDecoded, totalDroppedFrames: droppedFrames });
              }
            }
          }
          this.lastTime = currentTime;
          this.lastDroppedFrames = droppedFrames;
          this.lastDecodedFrames = decodedFrames;
        }
      }
    }
  }]);

  return FPSController;
}();

exports.default = FPSController;