from django import forms

from .models import Message


class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ("receiver", "ad", "text")


def get_message_form_class():
    return MessageForm
