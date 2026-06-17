from django.db.models import Count, Exists, OuterRef, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response as ApiResponse

from config.permissions import IsModerator, IsOwnerOrReadOnly

from .models import Ad, Category, Favorite, Response
from .serializers import (
    AdImageSerializer,
    AdSerializer,
    CategorySerializer,
    FavoriteSerializer,
    ResponseSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.annotate(
            active_ads_count=Count("ads", filter=Q(ads__status=Ad.Status.ACTIVE))
        ).order_by("name")


class AdViewSet(viewsets.ModelViewSet):
    serializer_class = AdSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Ad.objects.select_related("user", "category").prefetch_related("images")
        if self.request.user.is_authenticated:
            favorites = Favorite.objects.filter(user=self.request.user, ad=OuterRef("pk"))
            queryset = queryset.annotate(is_favorite=Exists(favorites))
        else:
            queryset = queryset.annotate(
                is_favorite=Exists(Favorite.objects.none())
            )

        if self.action == "list":
            queryset = queryset.filter(status=Ad.Status.ACTIVE)
        elif self.action == "retrieve" and not IsModerator().has_permission(self.request, self):
            if self.request.user.is_authenticated:
                queryset = queryset.filter(Q(status=Ad.Status.ACTIVE) | Q(user=self.request.user))
            else:
                queryset = queryset.filter(status=Ad.Status.ACTIVE)

        category = self.request.query_params.get("category")
        ad_type = self.request.query_params.get("ad_type")
        city = self.request.query_params.get("city")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category_id=category)
        if ad_type:
            queryset = queryset.filter(ad_type=ad_type)
        if city:
            queryset = queryset.filter(city__icontains=city)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=Ad.Status.MODERATION)

    def perform_update(self, serializer):
        instance = self.get_object()
        should_reset_status = (
            instance.user == self.request.user
            and not IsModerator().has_permission(self.request, self)
        )
        serializer.save(status=Ad.Status.MODERATION if should_reset_status else instance.status)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my(self, request):
        ads = (
            Ad.objects.select_related("user", "category")
            .prefetch_related("images")
            .filter(user=request.user)
        )
        return ApiResponse(self.get_serializer(ads, many=True).data)

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser],
        permission_classes=[permissions.IsAuthenticated],
    )
    def upload_image(self, request, pk=None):
        ad = self.get_object()
        if ad.user != request.user:
            return ApiResponse(status=status.HTTP_403_FORBIDDEN)
        serializer = AdImageSerializer(data={**request.data, "ad": ad.id})
        serializer.is_valid(raise_exception=True)
        serializer.save(ad=ad)
        return ApiResponse(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def set_status(self, request, pk=None):
        ad = self.get_object()
        new_status = request.data.get("status")
        if new_status not in Ad.Status.values:
            return ApiResponse(
                {"status": "Invalid status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ad.status = new_status
        ad.save(update_fields=["status", "updated_at"])
        return ApiResponse(self.get_serializer(ad).data)


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.select_related("ad", "ad__category", "ad__user").prefetch_related("ad__images").filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ResponseViewSet(viewsets.ModelViewSet):
    serializer_class = ResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Response.objects.select_related("ad", "user", "ad__user")
        mode = self.request.query_params.get("mode")
        if mode == "to_my_ads":
            return queryset.filter(ad__user=self.request.user)
        if mode == "my":
            return queryset.filter(user=self.request.user)
        return queryset.filter(Q(user=self.request.user) | Q(ad__user=self.request.user))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="my")
    def my_responses(self, request):
        responses = self.get_queryset().filter(user=request.user)
        return ApiResponse(self.get_serializer(responses, many=True).data)

    @action(detail=False, methods=["get"], url_path="to-my-ads")
    def to_my_ads(self, request):
        responses = self.get_queryset().filter(ad__user=request.user)
        return ApiResponse(self.get_serializer(responses, many=True).data)
