import * as React from 'react'
import { WebRTCPlayer as Player, WebRTCConfiguration } from 'wowza-webrtc-client'
import { IPlayerProps, IPlayer } from './IPlayer'

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
}

interface State {
  loadCount: number
  isMuted?: boolean
  isPlaying: boolean
  error?: Error
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
      isPlaying: true
    }
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
    const streamName = this.props.streamName
    if (!streamName) {
      throw new Error('Stream Name is required.')
    }
    this.playerInterface && this.playerInterface.connect(streamName)
  }

  public stop() {
    this.playerInterface && this.playerInterface.stop()
  }

  render() {
    return <div id={ this.props.id }>
      <video 
        ref={this._refVideo}
        playsInline autoPlay muted
        className="meeting-peer-player" 
        />
    </div>
  }
}