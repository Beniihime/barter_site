from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from ads.models import Ad, Category, Favorite, Response
from messages_app.models import Message
from moderation.models import Complaint
from users.models import Profile, Role


class Command(BaseCommand):
    help = "Create a rich demo dataset with accounts, admin access, ads, responses, messages, and complaints."

    def handle(self, *args, **options):
        roles = self._ensure_roles()
        categories = self._ensure_categories()
        users = self._ensure_users(roles)
        ads = self._ensure_ads(users, categories)
        self._ensure_responses(users, ads)
        self._ensure_messages(users, ads)
        self._ensure_complaints(users, ads)
        self._ensure_favorites(users, ads)

        self.stdout.write(self.style.SUCCESS("Seed data created or updated successfully."))
        self.stdout.write("Accounts:")
        self.stdout.write("  alina / demo12345")
        self.stdout.write("  maksim / demo12345")
        self.stdout.write("  sveta / demo12345")
        self.stdout.write("  moderator / demo12345")
        self.stdout.write("  superadmin / admin12345")

    def _ensure_roles(self):
        definitions = {
            Role.USER: "Пользователь платформы",
            Role.MODERATOR: "Модератор объявлений и жалоб",
            Role.ADMIN: "Администратор платформы",
        }
        roles = {}
        for name, description in definitions.items():
            role, _ = Role.objects.get_or_create(name=name, defaults={"description": description})
            if role.description != description:
                role.description = description
                role.save(update_fields=["description"])
            roles[name] = role
        return roles

    def _ensure_categories(self):
        definitions = {
            "Одежда": "Куртки, пальто, школьная форма и базовые вещи",
            "Обувь": "Обувь для детей и взрослых на каждый сезон",
            "Детские вещи": "Коляски, игрушки, одежда и всё для малышей",
            "Книги": "Учебники, художественная литература и развивающие книги",
            "Техника": "Бытовая и цифровая техника в рабочем состоянии",
            "Мебель": "Столы, стулья, кровати и предметы для дома",
            "Посуда": "Наборы посуды, кастрюли, кружки и кухонные мелочи",
            "Другое": "Полезные вещи, которым можно найти нового хозяина",
        }
        categories = {}
        for name, description in definitions.items():
            category, _ = Category.objects.get_or_create(name=name, defaults={"description": description})
            if category.description != description:
                category.description = description
                category.save(update_fields=["description"])
            categories[name] = category
        return categories

    def _ensure_users(self, roles):
        User = get_user_model()
        definitions = [
            {
                "username": "alina",
                "password": "demo12345",
                "email": "alina@example.com",
                "full_name": "Алина Воронцова",
                "city": "Омск",
                "phone": "+7 900 111-22-33",
                "role": roles[Role.USER],
            },
            {
                "username": "maksim",
                "password": "demo12345",
                "email": "maksim@example.com",
                "full_name": "Максим Орлов",
                "city": "Омск",
                "phone": "+7 900 222-33-44",
                "role": roles[Role.USER],
            },
            {
                "username": "sveta",
                "password": "demo12345",
                "email": "sveta@example.com",
                "full_name": "Светлана Егорова",
                "city": "Тара",
                "phone": "+7 900 333-44-55",
                "role": roles[Role.USER],
            },
            {
                "username": "moderator",
                "password": "demo12345",
                "email": "moderator@example.com",
                "full_name": "Мария Модератор",
                "city": "Омск",
                "phone": "+7 900 444-55-66",
                "role": roles[Role.MODERATOR],
                "is_staff": True,
            },
            {
                "username": "superadmin",
                "password": "admin12345",
                "email": "superadmin@example.com",
                "full_name": "Екатерина Администратор",
                "city": "Омск",
                "phone": "+7 900 555-66-77",
                "role": roles[Role.ADMIN],
                "is_staff": True,
                "is_superuser": True,
            },
        ]

        users = {}
        for item in definitions:
            user = self._upsert_user(User, item)
            users[item["username"]] = user
        return users

    def _upsert_user(self, User, item):
        user, _ = User.objects.get_or_create(
            username=item["username"],
            defaults={
                "email": item["email"],
                "is_staff": item.get("is_staff", False),
                "is_superuser": item.get("is_superuser", False),
            },
        )
        user.email = item["email"]
        user.is_staff = item.get("is_staff", False)
        user.is_superuser = item.get("is_superuser", False)
        user.set_password(item["password"])
        user.save()

        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                "full_name": item["full_name"],
                "phone": item["phone"],
                "city": item["city"],
                "role": item["role"],
            },
        )
        profile.full_name = item["full_name"]
        profile.phone = item["phone"]
        profile.city = item["city"]
        profile.role = item["role"]
        profile.save()
        return user

    def _ensure_ads(self, users, categories):
        definitions = [
            {
                "owner": "alina",
                "category": "Одежда",
                "title": "Пальто демисезонное 46 размера",
                "description": "Теплое женское пальто в хорошем состоянии. Подойдет на весну и осень, молнии и пуговицы целые.",
                "ad_type": Ad.AdType.FREE,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": "",
                "city": "Омск",
                "status": Ad.Status.ACTIVE,
            },
            {
                "owner": "alina",
                "category": "Посуда",
                "title": "Набор детской посуды",
                "description": "Тарелка, кружка и ложка для ребенка. Все чистое и без сколов, можно забрать в центре города.",
                "ad_type": Ad.AdType.FREE,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": "",
                "city": "Омск",
                "status": Ad.Status.ACTIVE,
            },
            {
                "owner": "maksim",
                "category": "Техника",
                "title": "Рабочая микроволновка",
                "description": "Микроволновая печь полностью рабочая, греет быстро, внешний вид аккуратный. Отдам семье, которой сейчас нужна техника.",
                "ad_type": Ad.AdType.EXCHANGE,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": "Рассмотрю обмен на детские книги или стул для школьника",
                "city": "Омск",
                "status": Ad.Status.ACTIVE,
            },
            {
                "owner": "maksim",
                "category": "Мебель",
                "title": "Письменный стол для школьника",
                "description": "Компактный стол со следами использования. Подойдет для учебы дома, столешница ровная, ножки крепкие.",
                "ad_type": Ad.AdType.FREE,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": "",
                "city": "Омск",
                "status": Ad.Status.MODERATION,
            },
            {
                "owner": "sveta",
                "category": "Детские вещи",
                "title": "Коляска после одного ребенка",
                "description": "Складная коляска в хорошем состоянии, колеса целые, механизм работает без проблем. Отдам тому, кому действительно нужна.",
                "ad_type": Ad.AdType.FREE,
                "item_condition": Ad.ItemCondition.LIKE_NEW,
                "exchange_request": "",
                "city": "Тара",
                "status": Ad.Status.ACTIVE,
            },
            {
                "owner": "sveta",
                "category": "Книги",
                "title": "Учебники 5-7 класс",
                "description": "Набор учебников и сборников задач, часть обложек потерта, но страницы все на месте и в пригодном состоянии.",
                "ad_type": Ad.AdType.EXCHANGE,
                "item_condition": Ad.ItemCondition.USED,
                "exchange_request": "Нужна школьная форма для девочки 128-134",
                "city": "Тара",
                "status": Ad.Status.ACTIVE,
            },
            {
                "owner": "sveta",
                "category": "Обувь",
                "title": "Детские зимние ботинки",
                "description": "Ботинки 31 размера, теплые и удобные, но есть износ подошвы. Создано как пример объявления, скрытого после проверки.",
                "ad_type": Ad.AdType.FREE,
                "item_condition": Ad.ItemCondition.NEEDS_REPAIR,
                "exchange_request": "",
                "city": "Тара",
                "status": Ad.Status.HIDDEN,
            },
        ]

        ads = {}
        for item in definitions:
            owner = users[item["owner"]]
            category = categories[item["category"]]
            ad, _ = Ad.objects.get_or_create(
                user=owner,
                title=item["title"],
                defaults={
                    "category": category,
                    "description": item["description"],
                    "ad_type": item["ad_type"],
                    "item_condition": item["item_condition"],
                    "exchange_request": item["exchange_request"],
                    "city": item["city"],
                    "status": item["status"],
                },
            )
            ad.category = category
            ad.description = item["description"]
            ad.ad_type = item["ad_type"]
            ad.item_condition = item["item_condition"]
            ad.exchange_request = item["exchange_request"]
            ad.city = item["city"]
            ad.status = item["status"]
            ad.save()
            ads[item["title"]] = ad
        return ads

    def _ensure_responses(self, users, ads):
        definitions = [
            ("Пальто демисезонное 46 размера", "sveta", "Здравствуйте! Могу забрать для мамы, если еще актуально."),
            ("Рабочая микроволновка", "alina", "Есть несколько детских книг, могу привезти на обмен."),
            ("Коляска после одного ребенка", "maksim", "Нужна сестре, можем забрать в выходные."),
            ("Учебники 5-7 класс", "alina", "Есть школьная форма 128 размера, давайте обсудим обмен."),
        ]
        for ad_title, username, text in definitions:
            Response.objects.get_or_create(
                ad=ads[ad_title],
                user=users[username],
                defaults={"text": text},
            )

    def _ensure_messages(self, users, ads):
        definitions = [
            ("alina", "sveta", "Пальто демисезонное 46 размера", "Добрый день! Уточните, пожалуйста, состояние рукавов."),
            ("sveta", "alina", "Пальто демисезонное 46 размера", "Здравствуйте! С рукавами все хорошо, могу прислать фото."),
            ("alina", "sveta", "Пальто демисезонное 46 размера", "Спасибо, тогда ориентируюсь забрать в пятницу."),
            ("maksim", "alina", "Рабочая микроволновка", "Подскажите, книги для какого возраста предлагаете на обмен?"),
            ("alina", "maksim", "Рабочая микроволновка", "Есть книги для младшей школы, могу показать список."),
            ("sveta", "maksim", "Коляска после одного ребенка", "Здравствуйте, коляску еще не забрали?"),
        ]
        for sender, receiver, ad_title, text in definitions:
            Message.objects.get_or_create(
                sender=users[sender],
                receiver=users[receiver],
                ad=ads[ad_title],
                text=text,
            )

    def _ensure_complaints(self, users, ads):
        definitions = [
            ("alina", "Детские зимние ботинки", "Похоже, объявление уже неактуально и требует проверки."),
            ("maksim", "Учебники 5-7 класс", "Хочу, чтобы модератор проверил корректность описания размеров."),
        ]
        for username, ad_title, reason in definitions:
            Complaint.objects.get_or_create(
                user=users[username],
                ad=ads[ad_title],
                defaults={"reason": reason},
            )

    def _ensure_favorites(self, users, ads):
        definitions = [
            ("alina", "Коляска после одного ребенка"),
            ("maksim", "Пальто демисезонное 46 размера"),
            ("sveta", "Набор детской посуды"),
        ]
        for username, ad_title in definitions:
            Favorite.objects.get_or_create(
                user=users[username],
                ad=ads[ad_title],
            )
