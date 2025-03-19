from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

"""
Filename: celery.py
Author: Pranav Pawar
Description: celery main file
"""

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio.settings')
app = Celery('potfolio')

app.config_from_object(settings, namespace='CELERY')

app.conf.beat_schedule = {
    'check_alerts_daily': {
        'task': 'asset.tasks.check_and_trigger_alerts',
        'schedule': crontab(minute='*'),  # Run every day at midnight
    },
}

app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')