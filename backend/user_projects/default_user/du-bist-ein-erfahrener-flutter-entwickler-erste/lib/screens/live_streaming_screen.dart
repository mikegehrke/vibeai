import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

class LiveStreamingScreen extends StatefulWidget {
  @override
  _LiveStreamingScreenState createState() => _LiveStreamingScreenState();
}

class _LiveStreamingScreenState extends State<LiveStreamingScreen> {
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  @override
  void initState() {
    super.initState();
    _initWebRTC();
  }

  _initWebRTC() async {
    // Erstelle lokale Medien
    _localStream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': {'facingMode': 'user'},
    });

    // Erstelle eine Peer Verbindung
    _peerConnection = await createPeerConnection({
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
      ]
    });

    // Füge lokale Streams zur Verbindung hinzu
    _peerConnection?.addStream(_localStream!);
  }

  @override
  void dispose() {
    _localStream?.dispose();
    _peerConnection?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Live Streaming')),
      body: Column(
        children: [
          Expanded(
            child: RTCVideoView(
              RTCVideoRenderer()
                ..initialize()
                ..srcObject = _localStream,
            ),
          ),
          // Weitere UI-Elemente für Streaming-Steuerung
        ],
      ),
    );
  }
}