"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var wowza_webrtc_client_1 = require("wowza-webrtc-client");
var WebRTCPlayer = /** @class */ (function (_super) {
    __extends(WebRTCPlayer, _super);
    function WebRTCPlayer(props) {
        var _this = _super.call(this, props) || this;
        _this._refFrame = React.createRef();
        _this._refVideo = React.createRef();
        _this.state = {
            loadCount: 0,
            isPlaying: false,
            videoStyle: {
                width: '100%',
                height: '100%'
            }
        };
        return _this;
    }
    Object.defineProperty(WebRTCPlayer.prototype, "isPlaying", {
        get: function () {
            return this.playerInterface && this.playerInterface.isPlaying || false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebRTCPlayer.prototype, "videoElement", {
        get: function () {
            return this._refVideo.current || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebRTCPlayer.prototype, "frameElement", {
        get: function () {
            return this._refFrame.current || undefined;
        },
        enumerable: true,
        configurable: true
    });
    WebRTCPlayer.prototype.componentDidMount = function () {
        var _this = this;
        this._initPlayer(this.props.autoPlay);
        // register a resize handler.
    };
    WebRTCPlayer.prototype.componentWillUnmount = function () {
        // unregister a resize handler.
        window.removeEventListener('resize', this.resizeHandler);
    };
    WebRTCPlayer.prototype._initPlayer = function (autoPlay) {
        var _this = this;
        if (!this.videoElement) {
            return;
        }
        // Create a new instance
        this.playerInterface = new wowza_webrtc_client_1.WebRTCPlayer(this.props.config, this.videoElement, function (_a) {
            var isMuted = _a.isMuted, isPlaying = _a.isPlaying, error = _a.error;
            _this.setState({ isMuted: isMuted, isPlaying: isPlaying, error: error });
            _this.props.onPlayerStateChanged && _this.props.onPlayerStateChanged({ isMuted: isMuted, isPlaying: isPlaying, error: error });
            _this.resizeHandler && _this.resizeHandler();
        });
        if (autoPlay) {
            setTimeout(this.play.bind(this), 3000);
        }
    };
    WebRTCPlayer.prototype.play = function () {
        var streamName = this.props.streamName;
        if (!streamName) {
            throw new Error('Stream Name is required.');
        }
        this.playerInterface && this.playerInterface.connect(streamName);
    };
    WebRTCPlayer.prototype.stop = function () {
        this.playerInterface && this.playerInterface.stop();
    };
    WebRTCPlayer.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { id: this.props.id, ref: this._refFrame, style: __assign({}, this.props.style), className: "webrtc-player " + this.props.sizing + " " + this.props.className },
            React.createElement("video", { ref: this._refVideo, playsInline: true, autoPlay: true, className: this.props.rotate, style: this.state.videoStyle }),
            this.playerInterface && this.state.isMuted &&
                React.createElement("div", { className: "unmute-blocker d-flex justify-content-center align-items-center", onClick: function () { return _this.playerInterface && (_this.playerInterface.isMuted = false); } },
                    this.props.children,
                    this.props.showUnmuteButton &&
                        React.createElement("button", { className: "btn btn-danger" },
                            React.createElement("i", { className: "fas fa-volume-mute" }),
                            " TAP TO UNMUTE")),
            this.state.error &&
                React.createElement("div", { className: "unmute-blocker d-flex justify-content-center align-items-center", onClick: this.play.bind(this) }, this.props.showErrorOverlay &&
                    React.createElement("p", { className: "text-danger text-center" }, "" + this.state.error.message,
                        React.createElement("br", null),
                        React.createElement("br", null),
                        React.createElement("button", { className: "btn btn-danger" },
                            React.createElement("i", { className: "fas redo-alt" }),
                            " TAP TO RETRY"))));
    };
    WebRTCPlayer.defaultProps = {
        disableAudio: false,
        autoPlay: true,
        rotate: 'none',
        showUnmuteButton: true,
        showErrorOverlay: true,
        className: '',
        sizing: 'contain'
    };
    return WebRTCPlayer;
}(React.Component));
exports.WebRTCPlayer = WebRTCPlayer;
