from rest_framework import serializers

from .models import Ad, AdImage, Category, Response


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "description")


class AdImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdImage
        fields = ("id", "ad", "image", "uploaded_at")
        read_only_fields = ("uploaded_at",)


class AdSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    category_detail = CategorySerializer(source="category", read_only=True)
    images = AdImageSerializer(many=True, read_only=True)

    class Meta:
        model = Ad
        fields = (
            "id",
            "user",
            "user_id",
            "category",
            "category_detail",
            "title",
            "description",
            "ad_type",
            "item_condition",
            "exchange_request",
            "city",
            "status",
            "images",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("user", "status", "created_at", "updated_at")

    def validate(self, attrs):
        ad_type = attrs.get("ad_type", getattr(self.instance, "ad_type", None))
        exchange_request = attrs.get(
            "exchange_request",
            getattr(self.instance, "exchange_request", ""),
        )
        if ad_type == Ad.AdType.EXCHANGE and not exchange_request.strip():
            raise serializers.ValidationError(
                {"exchange_request": "This field is required for exchange ads."}
            )
        return attrs


class AdModerationStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Ad.Status.choices)


class ResponseSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    ad_title = serializers.CharField(source="ad.title", read_only=True)

    class Meta:
        model = Response
        fields = ("id", "ad", "ad_title", "user", "text", "status", "created_at")
        read_only_fields = ("user", "status", "created_at")

    def validate(self, attrs):
        request = self.context.get("request")
        ad = attrs.get("ad")
        if request and ad and ad.user_id == request.user.id:
            raise serializers.ValidationError("You cannot respond to your own ad.")
        if ad and ad.status != Ad.Status.ACTIVE:
            raise serializers.ValidationError("You can respond only to active ads.")
        return attrs
