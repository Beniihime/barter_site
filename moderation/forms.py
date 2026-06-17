from django import forms

from .models import AdModeration, Complaint


class ComplaintForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = ("ad", "reason")


class ComplaintProcessForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = ("status", "moderator_comment")


class AdModerationForm(forms.ModelForm):
    class Meta:
        model = AdModeration
        fields = ("ad", "decision", "comment")


class ModerationActionForm(forms.Form):
    status = forms.ChoiceField(
        choices=(
            ("in_review", "In review"),
            ("closed", "Close"),
            ("rejected", "Reject"),
        ),
        required=False,
    )
    resolution_note = forms.CharField(required=False, widget=forms.Textarea)
