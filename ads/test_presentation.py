from django.test import TestCase
from django.urls import resolve


class AdsApiRouteTests(TestCase):
    def test_ads_api_list_is_registered(self):
        response = self.client.get("/api/ads/")

        self.assertEqual(response.status_code, 200)

    def test_create_ad_requires_authentication(self):
        response = self.client.post("/api/ads/", {})

        self.assertEqual(response.status_code, 403)

    def test_ads_route_resolves_to_viewset(self):
        match = resolve("/api/ads/")

        self.assertEqual(match.url_name, "ad-list")
