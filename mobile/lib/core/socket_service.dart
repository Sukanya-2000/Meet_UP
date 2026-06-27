import 'package:socket_io_client/socket_io_client.dart' as io;

import 'api_client.dart';

class SocketService {
  io.Socket? socket;

  void connect(String token) {
    final base = ApiClient.defaultBaseUrl.replaceFirst('/api', '');
    socket?.dispose();
    socket = io.io(base, io.OptionBuilder().setTransports(['websocket']).setAuth({'token': token}).disableAutoConnect().build());
    socket!.connect();
  }

  void joinMatch(String id) => socket?.emit('match:join', {'matchId': id, 'conversationId': id});

  void sendMessage(Map<String, dynamic> payload) => socket?.emit('message:send', payload);

  void typing(String conversationId, bool active) {
    socket?.emit(active ? 'typing:start' : 'typing:stop', {'matchId': conversationId, 'conversationId': conversationId});
  }

  void markRead(String conversationId) => socket?.emit('messages:read', {'matchId': conversationId, 'conversationId': conversationId});

  void dispose() {
    socket?.dispose();
    socket = null;
  }
}
