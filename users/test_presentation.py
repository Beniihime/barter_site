from django.contrib.auth import get_user_model
from django.test import TestCase


class UserApiRouteTests(TestCase):
    def test_me_requires_authentication(self):
        response = self.client.get("/api/users/me/")

        self.assertEqual(response.status_code, 403)

    def test_authenticated_me_is_available(self):
        user = get_user_model().objects.create_user(username="alice", password="pass12345")
        self.client.force_login(user)

        response = self.client.get("/api/users/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "alice")
