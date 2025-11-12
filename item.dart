import 'package:hive/hive.dart';

part 'item.g.dart';

@HiveType(typeId: 0)
class Item {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String itemCode;

  @HiveField(2)
  final String name;

  @HiveField(3)
  final String? description;

  @HiveField(4)
  final String categoryId;

  @HiveField(5)
  final String categoryName;

  @HiveField(6)
  final String? locationId;

  @HiveField(7)
  final String? locationCode;

  @HiveField(8)
  final int quantity;

  @HiveField(9)
  final int minQuantity;

  @HiveField(10)
  final String unit;

  @HiveField(11)
  final String? serialNumber;

  @HiveField(12)
  final String? manufacturer;

  @HiveField(13)
  final String? model;

  @HiveField(14)
  final String condition;

  @HiveField(15)
  final String status;

  @HiveField(16)
  final String? currentUserId;

  @HiveField(17)
  final String? image;

  @HiveField(18)
  final String? qrCodeUrl;

  @HiveField(19)
  final List<String> tags;

  @HiveField(20)
  final DateTime createdAt;

  @HiveField(21)
  final DateTime updatedAt;

  @HiveField(22)
  final bool isSynced;

  Item({
    required this.id,
    required this.itemCode,
    required this.name,
    this.description,
    required this.categoryId,
    required this.categoryName,
    this.locationId,
    this.locationCode,
    required this.quantity,
    required this.minQuantity,
    required this.unit,
    this.serialNumber,
    this.manufacturer,
    this.model,
    required this.condition,
    required this.status,
    this.currentUserId,
    this.image,
    this.qrCodeUrl,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
    this.isSynced = true,
  });

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      itemCode: json['itemCode'],
      name: json['name'],
      description: json['description'],
      categoryId: json['categoryId'],
      categoryName: json['category']?['name'] ?? '',
      locationId: json['locationId'],
      locationCode: json['location']?['coordinates'],
      quantity: json['quantity'] ?? 0,
      minQuantity: json['minQuantity'] ?? 1,
      unit: json['unit'] ?? 'un',
      serialNumber: json['serialNumber'],
      manufacturer: json['manufacturer'],
      model: json['model'],
      condition: json['condition'] ?? 'good',
      status: json['status'] ?? 'available',
      currentUserId: json['currentUserId'],
      image: json['image'],
      qrCodeUrl: json['qrCodeUrl'],
      tags: List<String>.from(json['tags'] ?? []),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      isSynced: true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'itemCode': itemCode,
      'name': name,
      'description': description,
      'categoryId': categoryId,
      'locationId': locationId,
      'quantity': quantity,
      'minQuantity': minQuantity,
      'unit': unit,
      'serialNumber': serialNumber,
      'manufacturer': manufacturer,
      'model': model,
      'condition': condition,
      'status': status,
      'currentUserId': currentUserId,
      'image': image,
      'tags': tags,
    };
  }

  Item copyWith({
    String? id,
    String? itemCode,
    String? name,
    String? description,
    String? categoryId,
    String? categoryName,
    String? locationId,
    String? locationCode,
    int? quantity,
    int? minQuantity,
    String? unit,
    String? serialNumber,
    String? manufacturer,
    String? model,
    String? condition,
    String? status,
    String? currentUserId,
    String? image,
    String? qrCodeUrl,
    List<String>? tags,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isSynced,
  }) {
    return Item(
      id: id ?? this.id,
      itemCode: itemCode ?? this.itemCode,
      name: name ?? this.name,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      locationId: locationId ?? this.locationId,
      locationCode: locationCode ?? this.locationCode,
      quantity: quantity ?? this.quantity,
      minQuantity: minQuantity ?? this.minQuantity,
      unit: unit ?? this.unit,
      serialNumber: serialNumber ?? this.serialNumber,
      manufacturer: manufacturer ?? this.manufacturer,
      model: model ?? this.model,
      condition: condition ?? this.condition,
      status: status ?? this.status,
      currentUserId: currentUserId ?? this.currentUserId,
      image: image ?? this.image,
      qrCodeUrl: qrCodeUrl ?? this.qrCodeUrl,
      tags: tags ?? this.tags,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isSynced: isSynced ?? this.isSynced,
    );
  }

  bool get isLowStock => quantity <= minQuantity;
  bool get isAvailable => status == 'available' && quantity > 0;
}
