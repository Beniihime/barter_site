from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)
    sender_id = serializers.IntegerField(source="sender.id", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)

    class Meta:
        model = Message
        fields = (
            "id",
            "sender",
            "sender_id",
            "receiver",
            "receiver_name",
            "ad",
            "ad_title",
            "text",
            "created_at",
            "is_read",
        )
        read_only_fields = ("sender", "created_at", "is_read")

    def validate(self, attrs):
        request = self.context.get("request")
        receiver = attrs.get("receiver")
        if request and receiver and receiver.id == request.user.id:
            raise serializers.ValidationError("You cannot send a message to yourself.")
        return attrs
