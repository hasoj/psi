# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-09 13:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('poll', '0002_auto_20161109_1300'),
    ]

    operations = [
        migrations.AddField(
            model_name='session',
            name='date_submitted',
            field=models.DateTimeField(null=True),
        ),
    ]
