from django import forms

from .models import Ad, Response


class AdSearchForm(forms.Form):
    q = forms.CharField(required=False)
    search = forms.CharField(required=False)
    status = forms.CharField(required=False)
    category = forms.IntegerField(required=False)
    ad_type = forms.ChoiceField(required=False, choices=[("", "Any")] + list(Ad.AdType.choices))
    city = forms.CharField(required=False)


class AdForm(forms.ModelForm):
    class Meta:
        model = Ad
        fields = (
            "category",
            "title",
            "description",
            "ad_type",
            "item_condition",
            "exchange_request",
            "city",
        )


class ResponseForm(forms.ModelForm):
    class Meta:
        model = Response
        fields = ("text",)


def get_ad_form_class():
    return AdForm


def get_exchange_offer_form_class():
    try:
        from .models import ExchangeOffer
    except ImportError:
        return ResponseForm

    class ExchangeOfferForm(forms.ModelForm):
        class Meta:
            model = ExchangeOffer
            fields = tuple(
                field
                for field in ("offered_ad", "message", "comment")
                if any(model_field.name == field for model_field in ExchangeOffer._meta.get_fields())
            )

    return ExchangeOfferForm
