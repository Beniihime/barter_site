from django.contrib.auth import get_user_model
from django.test import TestCase


class MessageApiRouteTests(TestCase):
    def test_messages_require_authentication(self):
        response = self.client.get("/api/messages/")

        self.assertEqual(response.status_code, 403)

    def test_authenticated_message_list_is_available(self):
        user = get_user_model().objects.create_user(username="alice", password="pass12345")
        self.client.force_login(user)

        response = self.client.get("/api/messages/")

        self.assertEqual(response.status_code, 200)
