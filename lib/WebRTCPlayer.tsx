import * as React from 'react'
import { WebRTCPlayer as Player, WebRTCConfiguration } from 'wowza-webrtc-client'
import { IPlayerProps, IPlayer } from './IPlayer'
import axios from "axios";

interface Props extends IPlayerProps {
  id: string
  style?: React.CSSProperties,      // Html CSS Properties
  streamName?: string
  videoRatio: number
  disableAudio: boolean
  autoPlay: boolean
  rotate: 'none'|'ccw'|'cw'|'flip'
  sizing: 'cover'|'contain'
  config: WebRTCConfiguration
  showUnmuteButton: boolean
  showErrorOverlay: boolean
  className: string
  videoClass: string
  userID: String
  appName: String
}

interface State {
  loadCount: number
  isMuted?: boolean
  isPlaying: boolean
  error?: Error
  videoStyle: React.CSSProperties
}

export class WebRTCPlayer extends React.Component<Props, State> implements IPlayer {

  public static defaultProps: Partial<Props> = {
    disableAudio: false,
    autoPlay: true,
    rotate: 'none',
    showUnmuteButton: true,
    showErrorOverlay: true,
    className: '',
    sizing: 'contain'
  }

  public get isPlaying(): boolean {
    return this.playerInterface && this.playerInterface.isPlaying || false
  }

  private get videoElement(): HTMLVideoElement|undefined {
    return this._refVideo.current || undefined
  }

  private get frameElement(): HTMLDivElement|undefined {
    return this._refFrame.current || undefined
  }

  private playerInterface?: Player

  private resizeHandler!: () => void

  private _refFrame = React.createRef<HTMLDivElement>()

  private _refVideo = React.createRef<HTMLVideoElement>()

  constructor(props: Props) {
    super(props)
    this.state = {
      loadCount: 0,
      isPlaying: false,
      videoStyle: {
        width: '100%',
        height: '100%'
      }
    }
  }

  componentDidMount() {
    this._initPlayer(this.props.autoPlay)

    // register a resize handler.
    this.resizeHandler = () => {
      const videoElement = this.videoElement
      const frameElement = this.frameElement
      if (!videoElement || !frameElement) { return }
      //
      const videoSize = {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      }
      let frameSize = {
        width: frameElement.clientWidth,
        height: frameElement.clientHeight
      }
      if (videoSize && frameSize) {
        // perform calculation
        const videoAspectRatio = videoSize.width / videoSize.height
        let outState: React.CSSProperties = {}
        // (1) Placement
        if (/(cw)/.test(this.props.rotate)) {
          frameSize = {
            height: frameSize.width,
            width: frameSize.height
          }
        }
        const frameAspectRatio = frameSize.width / frameSize.height
        let actualVideoSize: { width: number, height: number } = { width: 0, height: 0 }
        // console.log(`Input (s=${this.props.sizing}, v, f) = ratios[`, videoAspectRatio, frameAspectRatio, '] frame[', videoSize, frameSize, ']')

        // width dominate is based on given associated sizing option.
        if (this.props.sizing === 'contain' && videoAspectRatio > frameAspectRatio
          || this.props.sizing === 'cover' && videoAspectRatio < frameAspectRatio) {
          // width dominate
          // console.log(`Width dominate ...`, videoAspectRatio, frameAspectRatio)
          actualVideoSize = {
            width: frameSize.width,
            height: frameSize.width / videoAspectRatio
          }
          outState = {
            ...outState,
            width: `${actualVideoSize.width}px`,
            left: '0',
            top: `${frameSize.height/2 - actualVideoSize.height/2}px`,
          }
        } else {
          // height dominate
          // console.log(`Height dominate ...`, videoAspectRatio, frameAspectRatio)
          actualVideoSize = {
            width: frameSize.height * videoAspectRatio,
            height: frameSize.height
          }
          outState = {
            ...outState,
            height: `${actualVideoSize.height}px`,
            top: '0',
            left: `${frameSize.width/2 - actualVideoSize.width/2}px`,
          }
        }
        // (2) Offset Tweak
        if (/(cw)/.test(this.props.rotate)) {
          // left/top offset need to be adjusted accordingly.
          // Flip back
          frameSize = {
            height: frameSize.width,
            width: frameSize.height
          }
          outState.top = (frameSize.height - actualVideoSize.height) / 2
          outState.left = (frameSize.width - actualVideoSize.width) / 2
        }
        if (this.props.rotate === 'ccw') {
          outState.transform = 'rotate(-90deg)'
        } else if (this.props.rotate === 'cw') {
          outState.transform = 'rotate(90deg)'
        } else if (this.props.rotate === 'flip') {
          outState.transform = 'rotate(180deg)'
        }
      }
    }

    this.resizeHandler()

    window.addEventListener('resize', this.resizeHandler)
  }

  componentWillUnmount() {
    // unregister a resize handler.
    window.removeEventListener('resize', this.resizeHandler)
  }

  private _initPlayer(autoPlay: boolean) {
    if (!this.videoElement) {
      return
    }
    // Create a new instance
    this.playerInterface = new Player(this.props.config, this.videoElement, ({ isMuted, isPlaying, error }) => {
      this.setState({ isMuted, isPlaying, error })
      this.props.onPlayerStateChanged && this.props.onPlayerStateChanged({ isMuted, isPlaying, error })
      this.resizeHandler && this.resizeHandler()
    })
    if (autoPlay) {
      setTimeout(this.play.bind(this), 3000)
    }
  }

  public play() {
    const streamName = this.props.streamName;
    const userID = this.props.userID;
    const appName = this.props.appName;
    if (!streamName) {
      throw new Error('Stream Name is required.')
    }

    axios
     .post("/api/streams/getstreams/auth", {streamName: streamName, userID: userID, appName: appName})
     .then((res) => {
        const hashData = {
          hashed: res.data.hash,
          startTime: 0,
          endTime: 0
        }

        this.playerInterface && this.playerInterface.connect(streamName, hashData);
     })
     .catch((err) =>
       console.log(err)
     );
  }

  public stop() {
    this.playerInterface && this.playerInterface.stop()
  }

  render() {
    return <div id={ this.props.id } 
        ref={this._refFrame}
        style={{ ...this.props.style }}
        className={`webrtc-player ${this.props.sizing} ${this.props.className}`}>
      <video 
        ref={this._refVideo}
        playsInline autoPlay muted
        className={this.props.videoClass} 
        style={this.state.videoStyle}
        />
    </div>
  }
}