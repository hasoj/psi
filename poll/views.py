import json
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from poll import models

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
    return JsonResponse({"status": "ok", "groups": groups})

@require_POST
def submit(request):
    data = json.loads(request.body.decode("utf-8"))
    print(data)
    return JsonResponse({
        "status": "error",
        "reason": "not implemented",
    })

@require_GET
def statistics(request):
    return JsonResponse({
        "status": "error",
        "reason": "not implemented",
    })
