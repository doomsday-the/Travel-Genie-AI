from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User


class AuthTests(TestCase):
    def setUp(self):
        self.c = APIClient()

    def test_register_login_me(self):
        r = self.c.post("/api/auth/register/", {"username": "u1", "email": "u1@x.com", "password": "S7rong!Pass#1"})
        self.assertEqual(r.status_code, 201)
        t = self.c.post("/api/auth/login/", {"username": "u1", "password": "S7rong!Pass#1"}).data
        self.c.credentials(HTTP_AUTHORIZATION="Bearer " + t["access"])
        self.assertEqual(self.c.get("/api/auth/me/").data["username"], "u1")

    def test_password_is_argon2(self):
        u = User.objects.create_user("u2", "u2@x.com", "S7rong!Pass#1")
        self.assertTrue(u.password.startswith("argon2"))
