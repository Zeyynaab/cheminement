from django.urls import path
from . import views
urlpatterns = [
    path("cours/", views.list_cours, name="list_cours"),
    path("cours/ajouter/", views.ajouter_cours, name="ajouter_cours"),
    path('programmes/', views.list_programmes, name='list_programmes'),
    path("cours/modifier/<int:id>/", views.modifier_cours, name="modifier_cours"),
    path("cours/supprimer/<int:id>/", views.supprimer_cours, name="supprimer_cours"),
    path("prerequis/", views.list_prerequis, name="list_prerequis"),
    path("prerequis/ajouter/", views.ajouter_prerequis, name="ajouter_prerequis"),
    path("sessions/associer/", views.associer_cours_session, name='cours_session'),
    path("sessions/", views.list_sessions, name='list_sessions'),
    path('generer_cheminement/', views.generer_cheminement, name='generer_cheminement'),
    path("etudiants/", views.list_etudiants, name="list_etudiants"),
    path('graphe_cours/', views.generer_graphe),
    path('modifier-cours-par-session/<int:id>/', views.modifier_cours_par_session, name='modifier_cours_par_session'),


    
    ]