# Generated by Django 5.2 on 2025-05-14 20:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Inventario', '0006_rename_imagen_registroenergetico_imagen_1_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='registroenergetico',
            old_name='imagen_1',
            new_name='imagen',
        ),
        migrations.RemoveField(
            model_name='registroenergetico',
            name='imagen_2',
        ),
    ]
