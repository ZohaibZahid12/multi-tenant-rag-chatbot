from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Project user model.

    Identical to Django's default user for now. It exists so fields (e.g. a tenant link)
    can be added later without the painful mid-project switch away from auth.User.
    """
