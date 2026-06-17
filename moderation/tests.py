from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase

from ads.models import Ad, Category

from .models import AdModeration, Complaint


class ModerationModelTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.reporter = user_model.objects.create_user(username="reporter")
        self.owner = user_model.objects.create_user(username="owner")
        self.moderator = user_model.objects.create_user(username="moderator", is_staff=True)
        self.category = Category.objects.create(name="Appliances")
        self.ad = Ad.objects.create(
            user=self.owner,
            category=self.category,
            title="Electric kettle",
            description="Working electric kettle with minor cosmetic marks.",
            ad_type=Ad.AdType.FREE,
            item_condition=Ad.ItemCondition.USED,
            city="Omsk",
        )

    def test_user_can_complain_about_ad_once(self):
        Complaint.objects.create(user=self.reporter, ad=self.ad, reason="Spam")

        with self.assertRaises(IntegrityError):
            Complaint.objects.create(user=self.reporter, ad=self.ad, reason="Duplicate")

    def test_ad_moderation_string_contains_decision(self):
        moderation = AdModeration.objects.create(
            ad=self.ad,
            moderator=self.moderator,
            decision=AdModeration.Decision.APPROVED,
        )

        self.assertIn("Approved", str(moderation))
