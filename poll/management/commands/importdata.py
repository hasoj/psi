import json
from datetime import datetime
from django.core.management.base import BaseCommand
from poll import models

class Command(BaseCommand):
    help = 'Import a group/question/choice json database'

    def add_arguments(self, parser):
        parser.add_argument('json_path', help="Path to the json file")

    def handle(self, json_path, **options):
        with open(json_path) as f:
            data = json.load(f)
        if not data:
            raise Exception("The json file was not loaded properly")
        for group in data['groups']:
            g = models.QuestionGroup(
                heading=group['heading'],
                id=group['id'],
                text=group['text'],
                date_added=datetime.now(),
                date_modified=datetime.now(),
            )
            g.save()
            print("SAVE", g)
            for question in group['questions']:
                q = models.Question(
                    id=question['id'],
                    text=question['text'],
                    date_added=datetime.now(),
                    date_modified=datetime.now(),
                )
                q.question_group = g
                q.save()
                print("SAVE", q)
                for choice in question['choices']:
                    c = models.Choice(
                        option=choice['option'],
                        id=choice['id'],
                        text=choice['text'],
                        date_added=datetime.now(),
                        date_modified=datetime.now(),
                    )
                    c.question = q
                    c.save()
                    print("SAVE", c)
