from django.db import models


class QuestionGroup(models.Model):
    heading = models.TextField()
    text = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now=True)
    date_modified = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id) + ". " + self.heading


class Question(models.Model):
    text = models.TextField()
    question_group = models.ForeignKey(QuestionGroup)
    date_added = models.DateTimeField(auto_now=True)
    date_modified = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id) + ". " + self.text


class Choice(models.Model):
    text = models.TextField()
    question = models.ForeignKey(Question)
    option = models.CharField(max_length=2, default='X')
    date_added = models.DateTimeField(auto_now=True)
    date_modified = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id) + ". " + self.text


class Session(models.Model):
    name = models.TextField(blank=True)
    ip = models.CharField(max_length=200)
    date_added = models.DateTimeField(auto_now=True)
    date_submitted = models.DateTimeField(null=True)


class Response(models.Model):
    choice = models.ForeignKey(Choice)
    session = models.ForeignKey(Session)
    value = models.IntegerField()
    date_added = models.DateTimeField(auto_now=True)
    date_modified = models.DateTimeField(auto_now_add=True)
