# Generated by Django 5.2 on 2025-04-29 21:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Inventario', '0003_registroenergetico_refrigerante_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ambiente',
            name='sede',
        ),
        migrations.AddField(
            model_name='ambiente',
            name='sede_nombre',
            field=models.CharField(default='CEAI', max_length=100),
            preserve_default=False,
        ),
    ]
