from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Message.objects.select_related("sender", "receiver", "ad").filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        )
        ad_id = self.request.query_params.get("ad")
        if ad_id:
            queryset = queryset.filter(ad_id=ad_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=["get"], url_path="unread")
    def unread(self, request):
        messages = self.get_queryset().filter(receiver=request.user, is_read=False)
        return Response(self.get_serializer(messages, many=True).data)

    @action(detail=True, methods=["post"], url_path="mark-read")
    def mark_read(self, request, pk=None):
        message = self.get_object()
        if message.receiver == request.user and not message.is_read:
            message.is_read = True
            message.save(update_fields=["is_read"])
        return Response(self.get_serializer(message).data)
