from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from ads.models import Ad, Category, Response
from messages_app.models import Message
from moderation.models import Complaint
from users.models import Profile, Role


class Command(BaseCommand):
    help = "Create demo data for the barter MVP."

    def handle(self, *args, **options):
        user_role, _ = Role.objects.get_or_create(
            name=Role.USER,
            defaults={"description": "Regular platform user"},
        )
        moderator_role, _ = Role.objects.get_or_create(
            name=Role.MODERATOR,
            defaults={"description": "Moderator with access to complaint and ad review"},
        )

        categories = {}
        for name in [
            "Одежда",
            "Обувь",
            "Книги",
            "Мебель",
            "Бытовая техника",
            "Детские товары",
            "Предметы для дома",
        ]:
            categories[name], _ = Category.objects.get_or_create(name=name)

        User = get_user_model()
        users = {
            "ivan": self._user(User, "ivan", "demo12345", "ivan@example.com", "Иван Петров", "Омск", user_role),
            "anna": self._user(User, "anna", "demo12345", "anna@example.com", "Анна Смирнова", "Омск", user_role),
            "moderator": self._user(
                User,
                "moderator",
                "demo12345",
                "moderator@example.com",
                "Мария Модератор",
                "Омск",
                moderator_role,
                is_staff=True,
            ),
        }

        book = self._ad(
            users["ivan"],
            categories["Книги"],
            "Книга по Python",
            "Учебник по Python в хорошем состоянии, подойдет для начинающих.",
            Ad.AdType.EXCHANGE,
            "Хочу обменять на книгу по Django",
            Ad.Status.ACTIVE,
        )
        kettle = self._ad(
            users["anna"],
            categories["Бытовая техника"],
            "Электрический чайник",
            "Рабочий электрический чайник, есть небольшие следы использования.",
            Ad.AdType.FREE,
            "",
            Ad.Status.MODERATION,
        )
        chair = self._ad(
            users["ivan"],
            categories["Мебель"],
            "Деревянный стул",
            "Крепкий деревянный стул для кухни или дачи.",
            Ad.AdType.FREE,
            "",
            Ad.Status.ACTIVE,
        )

        Response.objects.get_or_create(
            ad=book,
            user=users["anna"],
            defaults={"text": "Готова обменять на книгу по Django."},
        )
        Message.objects.get_or_create(
            sender=users["anna"],
            receiver=users["ivan"],
            ad=book,
            text="Здравствуйте! Книга еще доступна?",
        )
        Complaint.objects.get_or_create(
            user=users["anna"],
            ad=chair,
            defaults={"reason": "Нужно проверить актуальность объявления."},
        )

        self.stdout.write(self.style.SUCCESS("Demo data created."))
        self.stdout.write("Users: ivan/demo12345, anna/demo12345, moderator/demo12345")

    def _user(self, User, username, password, email, full_name, city, role, is_staff=False):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": email, "is_staff": is_staff},
        )
        if created:
            user.set_password(password)
            user.save(update_fields=["password"])
        Profile.objects.get_or_create(
            user=user,
            defaults={"full_name": full_name, "city": city, "role": role},
        )
        return user

    def _ad(self, user, category, title, description, ad_type, exchange_request, status):
        ad, _ = Ad.objects.get_or_create(
            user=user,
            title=title,
            defaults={
                "category": category,
                "description": description,
                "ad_type": ad_type,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": exchange_request,
                "city": "Омск",
                "status": status,
            },
        )
        return ad
