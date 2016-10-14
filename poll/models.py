from django.db import models


class QuestionGroup(models.Model):
    heading = models.TextField()
    text = models.TextField(blank=True)


class Question(models.Model):
    text = models.TextField()
    question_group = models.ForeignKey(QuestionGroup)


class Choice(models.Model):
    text = models.TextField()
    question = models.ForeignKey(Question)


class Session(models.Model):
    name = models.TextField(blank=True)
    ip = models.CharField(max_length=200)
    time_submitted = models.DateTimeField(auto_now=True)


class Response(models.Model):
    choice = models.ForeignKey(Choice)
    session = models.ForeignKey(Session)
    value = models.IntegerField()

