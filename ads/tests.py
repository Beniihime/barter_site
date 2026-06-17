from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Ad, Category, Response


class AdsModelTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(username="owner")
        self.responder = user_model.objects.create_user(username="responder")
        self.category = Category.objects.create(name="Books", description="Books and journals")
        self.ad = Ad.objects.create(
            user=self.owner,
            category=self.category,
            title="Django book",
            description="A detailed Django book in good condition.",
            ad_type=Ad.AdType.EXCHANGE,
            item_condition=Ad.ItemCondition.USED,
            exchange_request="Another programming book",
            city="Omsk",
            status=Ad.Status.ACTIVE,
        )

    def test_exchange_ad_requires_exchange_request(self):
        ad = Ad(
            user=self.owner,
            category=self.category,
            title="Python book",
            description="A detailed Python book in good condition.",
            ad_type=Ad.AdType.EXCHANGE,
            item_condition=Ad.ItemCondition.USED,
            city="Omsk",
        )

        with self.assertRaises(ValidationError):
            ad.full_clean()

    def test_user_cannot_respond_to_own_ad(self):
        response = Response(ad=self.ad, user=self.owner, text="I want it")

        with self.assertRaises(ValidationError):
            response.full_clean()

    def test_response_is_unique_per_user_and_ad(self):
        Response.objects.create(ad=self.ad, user=self.responder, text="First response")

        with self.assertRaises(IntegrityError):
            Response.objects.create(ad=self.ad, user=self.responder, text="Second response")


class AdsApiTests(TestCase):
    def test_active_ads_are_public(self):
        user = get_user_model().objects.create_user(username="owner")
        category = Category.objects.create(name="Furniture")
        Ad.objects.create(
            user=user,
            category=category,
            title="Wooden chair",
            description="A solid wooden chair for home use.",
            ad_type=Ad.AdType.FREE,
            item_condition=Ad.ItemCondition.USED,
            city="Omsk",
            status=Ad.Status.ACTIVE,
        )

        response = APIClient().get("/api/ads/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
