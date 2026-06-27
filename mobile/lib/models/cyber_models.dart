class Profile {
  Profile({required this.userId, required this.firstName, this.city = '', this.dob, this.bio = '', this.interests = const [], this.photos = const [], this.isVerified = false});
  final String userId;
  final String firstName;
  final String city;
  final String? dob;
  final String bio;
  final List<String> interests;
  final List<Photo> photos;
  final bool isVerified;

  factory Profile.fromJson(Map<String, dynamic> json) => Profile(
        userId: '${json['userId'] ?? json['_id'] ?? ''}',
        firstName: '${json['firstName'] ?? 'CyberNest member'}',
        city: '${json['city'] ?? ''}',
        dob: json['dob']?.toString(),
        bio: '${json['bio'] ?? ''}',
        interests: (json['interests'] as List? ?? []).map((e) => '$e').toList(),
        photos: (json['photos'] as List? ?? []).map((e) => Photo.fromJson(Map<String, dynamic>.from(e))).toList(),
        isVerified: json['isVerified'] == true,
      );
}

class Photo {
  Photo({required this.id, required this.url, this.isMain = false});
  final String id;
  final String url;
  final bool isMain;
  factory Photo.fromJson(Map<String, dynamic> json) => Photo(id: '${json['_id'] ?? ''}', url: '${json['imageUrl'] ?? ''}', isMain: json['isMain'] == true);
}

class MatchItem {
  MatchItem({required this.id, this.conversationId, this.profile, this.photo, this.lastMessage, this.unreadCount = 0, this.otherUserId = ''});
  final String id;
  final String? conversationId;
  final Profile? profile;
  final Photo? photo;
  final Map<String, dynamic>? lastMessage;
  final int unreadCount;
  final String otherUserId;
  factory MatchItem.fromJson(Map<String, dynamic> json) => MatchItem(
        id: '${json['_id']}',
        conversationId: json['conversation']?['_id']?.toString(),
        profile: json['profile'] == null ? null : Profile.fromJson(Map<String, dynamic>.from(json['profile'])),
        photo: json['photo'] == null ? null : Photo.fromJson(Map<String, dynamic>.from(json['photo'])),
        lastMessage: json['lastMessage'] == null ? null : Map<String, dynamic>.from(json['lastMessage']),
        unreadCount: json['unreadCount'] ?? 0,
        otherUserId: '${json['otherUserId'] ?? ''}',
      );
}

class ChatMessage {
  ChatMessage({required this.id, required this.senderId, this.text = '', this.message = '', this.createdAt, this.readAt, this.deliveredAt, this.attachments = const []});
  final String id;
  final String senderId;
  final String text;
  final String message;
  final String? createdAt;
  final String? readAt;
  final String? deliveredAt;
  final List<Map<String, dynamic>> attachments;
  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: '${json['_id']}',
        senderId: '${json['senderId']}',
        text: '${json['text'] ?? ''}',
        message: '${json['message'] ?? ''}',
        createdAt: json['createdAt']?.toString(),
        readAt: json['readAt']?.toString(),
        deliveredAt: json['deliveredAt']?.toString(),
        attachments: (json['attachments'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)).toList(),
      );
}
