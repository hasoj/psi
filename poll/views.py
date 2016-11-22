import json
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from poll import models

def get_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_open_session(request):
    ip = get_ip(request)
    unclosed_sessions = models.Session.objects.filter(ip=ip, date_submitted__isnull=True)
    if unclosed_sessions:
        session = unclosed_sessions.get()
    else:
        session = models.Session(ip=ip, date_added=timezone.now())
    return session

def get_closed_sessions(request):
    ip = get_ip(request)
    closed_sessions = models.Session.objects\
        .filter(ip=ip, date_submitted__isnull=False)\
        .order_by('-date_submitted')
    return closed_sessions.all()

def finish_session(request, responses):
    session = get_open_session(request)
    session.date_submitted = timezone.now()
    session.save()
    for ans in responses:
        choice_id = ans['id']
        choice_value = ans['value']
        response = models.Response(
            choice_id=choice_id,
            value=choice_value,
            session=session,
        )
        response.save()
    return session

@require_GET
def state(request):
    ip = get_ip(request)
    closed_sessions = get_closed_sessions(request)
    response = {
        "status": "ok",
    }

    num_open_sessions = models.Session.objects.filter(ip=ip, date_submitted__isnull=True).count()
    response['hasUnfinishedTest'] = bool(num_open_sessions)

    if not closed_sessions:
        response["hasFinishedTests"] = False
    else:
        response["hasFinishedTests"] = True
        response["ownTestResults"] = [
            s.as_json_with_scores()
            for s in closed_sessions[:5]
        ]
    response["otherRecentTests"] = [
        s.as_json_with_scores()
        for s in models.Session.objects
            .filter(date_submitted__isnull=False).exclude(ip=ip)
            .order_by("-date_submitted")[:5]
    ]
    return JsonResponse(response)

@require_GET
def questions(request):
    def _get_choices(question):
        return [
            {
                "id": c.id,
                "text": c.text,
                "option": c.option,
            }
            for c in question.choice_set.all()
        ]
    def _get_questions(group):
        return [
            {
                "id": q.id,
                "text": q.text,
                "choices": _get_choices(q),
            }
            for q in group.question_set.all()
        ]
    groups = [
        {
            "id": g.id,
            "heading": g.heading,
            "text": g.text,
            "questions": _get_questions(g),
        }
        for g in models.QuestionGroup.objects.all()
    ]
    get_open_session(request)
    return JsonResponse(
        {
            "status": "ok",
            "groups": groups,
        }
    )

@require_POST
def submit(request):
    data = json.loads(request.body.decode("utf-8"))
    responses = data['responses']
    session = finish_session(request, responses)
    response = session.as_json_with_scores()
    response["status"] = "ok"
    return JsonResponse(response)

@require_GET
def statistics(request):
    return JsonResponse({
        "status": "ok",
        "numberOfTestsTaken": models.Session.objects.filter(date_submitted__isnull=False).count(),
        "numberOfUnfinishedTests": models.Session.objects.filter(date_submitted__isnull=True).count(),
    })
