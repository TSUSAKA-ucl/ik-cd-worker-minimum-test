const EDGE_IP = location.hostname; // ← エッジサーバーのIPアドレス
const WHEP_URL = `https://${EDGE_IP}:8190/cam1/whep`;

// 引数でvideoタグのIDをもらう
export async function startWebRTC(videoId='edge-video') {
  const video = document.getElementById(videoId);
  if (!video) {
    console.error(`videoタグが見つかりません: id=${videoId}`);
    return;
  }
  // 1. PeerConnection の作成
  const pc = new RTCPeerConnection({
    iceServers: [] // ローカルネットワーク（IP reachable）のためSTUNサーバー不要
  });
  
  pc.onicecandidate = e => {
    console.log("candidate", e.candidate);
  };
  pc.onicegatheringstatechange = () => {
    console.log("gathering", pc.iceGatheringState);
  };
  pc.oniceconnectionstatechange = () => {
    console.log("ICE", pc.iceConnectionState);
  };

  // 映像トラックを受信したときの処理
  pc.ontrack = (event) => {
    if (video.srcObject !== event.streams[0]) {
      video.srcObject = event.streams[0];
      console.log("WebRTCストリームを受信しました");
      console.log(video.readyState);
      console.log("width,height:", video.videoWidth, video.videoHeight);

      video.onloadedmetadata = () => {
	console.log("metadata", video.videoWidth, video.videoHeight);
      };
      video.play()
	.then(() => {
	  console.log("play() resolved")
	})
	.catch(err => console.error("play() failed", err));
    }
  };

  // 2. 受信用のみ（recvonly）のトランスシーバーを追加
  pc.addTransceiver('video', { direction: 'recvonly' });

  // 3. SDP Offerを作成
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  // console.log("localDescription:", pc.localDescription.sdp);

  // 4. MediaMTXのWHEPエンドポイントへSDPを送信（シグナリング）
  try {
    const response = await fetch(WHEP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: offer.sdp
    });
    if (!response.ok) throw new Error('MediaMTXへの接続に失敗しました');

    const answerSdp = await response.text();
    
    // 5. サーバーからの SDP Answer を設定
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp
    }));

  } catch (error) {
    console.error("WebRTC接続エラー:", error);
  }
}
