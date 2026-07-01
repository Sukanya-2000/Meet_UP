import crypto from 'crypto';
class CallProvider { async createRoom() { throw new Error('Not implemented'); } async closeRoom() { throw new Error('Not implemented'); } }
class DummyCallProvider extends CallProvider { async createRoom({ callId }) { return { provider: 'dummy', roomId: `dummy_${callId}_${crypto.randomBytes(5).toString('hex')}`, token: null, signaling: 'socket.io' }; } async closeRoom() { return true; } }
class WebRtcReadyProvider extends CallProvider { async createRoom({ callId }) { return { provider: 'webrtc', roomId: `webrtc_${callId}`, token: null, signaling: 'socket.io' }; } async closeRoom() { return true; } }
export const getCallProvider = () => process.env.CALL_PROVIDER === 'webrtc' ? new WebRtcReadyProvider() : new DummyCallProvider();
