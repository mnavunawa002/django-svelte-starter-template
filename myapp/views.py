from inertia import render

from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json


def welcome(request):
    props = {
        'username': request.user.get_username() if request.user.is_authenticated else 'Guest',
    }
    return render(request, 'Welcome', props)


@require_POST
def counter(request):
    count = json.loads(request.body).get('count', 0)
    count = int(count) + 1
    return JsonResponse({
        'count': count,
    })