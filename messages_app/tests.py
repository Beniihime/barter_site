from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from ads.models import Ad, Category

from .models import Message


class MessageModelTests(TestCase):
    def test_message_receiver_must_be_another_user(self):
        user_model = get_user_model()
        sender = user_model.objects.create_user(username="sender")
        category = Category.objects.create(name="Electronics")
        ad = Ad.objects.create(
            user=sender,
            category=category,
            title="Bluetooth speaker",
            description="Portable speaker with working battery and charger.",
            ad_type=Ad.AdType.FREE,
            item_condition=Ad.ItemCondition.USED,
            city="Omsk",
        )
        message = Message(sender=sender, receiver=sender, ad=ad, text="Hello")

        with self.assertRaises(ValidationError):
            message.full_clean()
