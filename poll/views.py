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

def get_session(request):
    ip = get_ip(request)
    unclosed_sessions = models.Session.objects.filter(ip=ip, date_submitted__isnull=True)
    if unclosed_sessions:
        session = unclosed_sessions.get()
    else:
        session = models.Session(ip=ip, date_added=timezone.now())
    return session

def finish_session(request, responses):
    session = get_session(request)
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

def calculate_scores(session):
    options = ["A", "B", "C", "D"]
    num_ans = {o: 0 for o in options}
    sum_ans = {o: 0.0 for o in options}

    for answer in session.response_set.all():
        option = answer.choice.option
        num_ans[option] += 1
        sum_ans[option] += answer.value

    for o in options:
        if num_ans[o] == 0:
            num_ans[o] = 1

    return {o: sum_ans[o] / num_ans[o] for o in options}

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

    get_session(request)

    return JsonResponse({"status": "ok", "groups": groups})

@require_POST
def submit(request):
    data = json.loads(request.body.decode("utf-8"))
    responses = data['responses']

    session = finish_session(request, responses)
    scores = calculate_scores(session)
    print(scores)
    return JsonResponse({
        "status": "ok",
        "scores": scores,
    })

@require_GET
def statistics(request):
    return JsonResponse({
        "status": "error",
        "reason": "not implemented",
    })
