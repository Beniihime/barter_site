from rest_framework import serializers

from .models import AdModeration, Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)

    class Meta:
        model = Complaint
        fields = (
            "id",
            "user",
            "ad",
            "ad_title",
            "reason",
            "status",
            "moderator_comment",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user", "status", "moderator_comment", "created_at", "updated_at")


class ComplaintProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ("status", "moderator_comment")


class AdModerationSerializer(serializers.ModelSerializer):
    moderator = serializers.StringRelatedField(read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)

    class Meta:
        model = AdModeration
        fields = ("id", "ad", "ad_title", "moderator", "decision", "comment", "checked_at")
        read_only_fields = ("moderator", "checked_at")
