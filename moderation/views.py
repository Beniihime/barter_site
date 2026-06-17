from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ads.models import Ad
from ads.serializers import AdSerializer
from config.permissions import IsModerator, IsOwnerOrModerator

from .models import AdModeration, Complaint
from .serializers import (
    AdModerationSerializer,
    ComplaintProcessSerializer,
    ComplaintSerializer,
)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer

    def get_permissions(self):
        if self.action == "process":
            return [IsModerator()]
        if self.action in {"retrieve", "destroy"}:
            return [permissions.IsAuthenticated(), IsOwnerOrModerator()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Complaint.objects.select_related("user", "ad")
        if self.request.user.is_authenticated and not self.request.user.is_staff:
            profile = getattr(self.request.user, "profile", None)
            role = getattr(getattr(profile, "role", None), "name", "")
            if role not in {"moderator", "admin"}:
                return queryset.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsModerator])
    def process(self, request, pk=None):
        complaint = self.get_object()
        serializer = ComplaintProcessSerializer(
            complaint,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ComplaintSerializer(complaint).data)


class ModerationViewSet(viewsets.ViewSet):
    permission_classes = [IsModerator]

    def list(self, request):
        ads = Ad.objects.select_related("user", "category").filter(
            status=Ad.Status.MODERATION
        )
        return Response(AdSerializer(ads, many=True).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._record_decision(request, pk, AdModeration.Decision.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._record_decision(request, pk, AdModeration.Decision.REJECTED)

    @action(detail=True, methods=["post"])
    def hide(self, request, pk=None):
        return self._record_decision(request, pk, AdModeration.Decision.HIDDEN)

    def _record_decision(self, request, pk, decision):
        try:
            ad = Ad.objects.get(pk=pk)
        except Ad.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        status_map = {
            AdModeration.Decision.APPROVED: Ad.Status.ACTIVE,
            AdModeration.Decision.REJECTED: Ad.Status.REJECTED,
            AdModeration.Decision.HIDDEN: Ad.Status.HIDDEN,
        }
        ad.status = status_map[decision]
        ad.save(update_fields=["status", "updated_at"])
        moderation = AdModeration.objects.create(
            ad=ad,
            moderator=request.user,
            decision=decision,
            comment=request.data.get("comment", ""),
        )
        return Response(AdModerationSerializer(moderation).data)
