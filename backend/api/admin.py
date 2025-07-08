from django.contrib import admin

from .models import Programme, Cours, Session, Prerequis, Cheminement, Etudiant, CoursParSession

admin.site.register(Programme)
admin.site.register(Cours)
admin.site.register(Session)
admin.site.register(Prerequis)
admin.site.register(Cheminement)
admin.site.register(Etudiant)
admin.site.register(CoursParSession)
