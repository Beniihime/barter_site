from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm

from .models import Profile


class RegistrationForm(UserCreationForm):
    full_name = forms.CharField(max_length=150)
    phone = forms.CharField(max_length=20, required=False)
    city = forms.CharField(max_length=80, required=False)

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("username", "email", "full_name", "phone", "city")


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ("full_name", "phone", "city")
