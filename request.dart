import 'package:hive/hive.dart';

part 'request.g.dart';

@HiveType(typeId: 1)
class Request {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String requestCode;

  @HiveField(2)
  final String requesterId;

  @HiveField(3)
  final String requesterName;

  @HiveField(4)
  final String itemId;

  @HiveField(5)
  final String itemName;

  @HiveField(6)
  final int quantity;

  @HiveField(7)
  final String purpose;

  @HiveField(8)
  final DateTime? expectedReturnDate;

  @HiveField(9)
  final String priority;

  @HiveField(10)
  final String status;

  @HiveField(11)
  final String? approverId;

  @HiveField(12)
  final String? approverName;

  @HiveField(13)
  final DateTime? approvalDate;

  @HiveField(14)
  final String? approvalNotes;

  @HiveField(15)
  final String? rejectionReason;

  @HiveField(16)
  final DateTime? completionDate;

  @HiveField(17)
  final DateTime createdAt;

  @HiveField(18)
  final DateTime updatedAt;

  @HiveField(19)
  final bool isSynced;

  Request({
    required this.id,
    required this.requestCode,
    required this.requesterId,
    required this.requesterName,
    required this.itemId,
    required this.itemName,
    required this.quantity,
    required this.purpose,
    this.expectedReturnDate,
    required this.priority,
    required this.status,
    this.approverId,
    this.approverName,
    this.approvalDate,
    this.approvalNotes,
    this.rejectionReason,
    this.completionDate,
    required this.createdAt,
    required this.updatedAt,
    this.isSynced = true,
  });

  factory Request.fromJson(Map<String, dynamic> json) {
    return Request(
      id: json['id'],
      requestCode: json['requestCode'],
      requesterId: json['requesterId'],
      requesterName: json['requester']?['name'] ?? '',
      itemId: json['itemId'],
      itemName: json['item']?['name'] ?? '',
      quantity: json['quantity'],
      purpose: json['purpose'],
      expectedReturnDate: json['expectedReturnDate'] != null
          ? DateTime.parse(json['expectedReturnDate'])
          : null,
      priority: json['priority'] ?? 'normal',
      status: json['status'],
      approverId: json['approverId'],
      approverName: json['approver']?['name'],
      approvalDate: json['approvalDate'] != null
          ? DateTime.parse(json['approvalDate'])
          : null,
      approvalNotes: json['approvalNotes'],
      rejectionReason: json['rejectionReason'],
      completionDate: json['completionDate'] != null
          ? DateTime.parse(json['completionDate'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      isSynced: true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requestCode': requestCode,
      'requesterId': requesterId,
      'itemId': itemId,
      'quantity': quantity,
      'purpose': purpose,
      'expectedReturnDate': expectedReturnDate?.toIso8601String(),
      'priority': priority,
      'status': status,
      'approverId': approverId,
      'approvalNotes': approvalNotes,
      'rejectionReason': rejectionReason,
    };
  }

  String get statusText {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Concluída';
      default:
        return status;
    }
  }

  String get priorityText {
    switch (priority) {
      case 'low':
        return 'Baixa';
      case 'normal':
        return 'Normal';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  }

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  bool get isCompleted => status == 'completed';
  bool get canCancel => status == 'pending' || status == 'approved';
}
