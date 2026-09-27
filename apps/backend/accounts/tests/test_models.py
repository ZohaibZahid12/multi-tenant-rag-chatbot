import pytest
from django.db import IntegrityError

from accounts.models import User

pytestmark = pytest.mark.django_db


def test_creates_user_with_usable_password():
    user = User.objects.create_user(username="alice", password="a-strong-password")

    assert user.pk is not None
    assert user.check_password("a-strong-password")


def test_username_must_be_unique():
    User.objects.create_user(username="bob", password="a-strong-password")

    with pytest.raises(IntegrityError):
        User.objects.create_user(username="bob", password="another-password")
