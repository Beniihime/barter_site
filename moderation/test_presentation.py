from django.contrib.auth import get_user_model
from django.test import TestCase


class ModerationApiRouteTests(TestCase):
    def test_moderation_queue_requires_authentication(self):
        response = self.client.get("/api/moderation/")

        self.assertEqual(response.status_code, 403)

    def test_moderation_queue_requires_moderator(self):
        user = get_user_model().objects.create_user(username="alice", password="pass12345")
        self.client.force_login(user)

        response = self.client.get("/api/moderation/")

        self.assertEqual(response.status_code, 403)

    def test_staff_moderator_can_open_queue(self):
        user = get_user_model().objects.create_user(
            username="moderator",
            password="pass12345",
            is_staff=True,
        )
        self.client.force_login(user)

        response = self.client.get("/api/moderation/")

        self.assertEqual(response.status_code, 200)
