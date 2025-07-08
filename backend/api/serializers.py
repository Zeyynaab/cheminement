from rest_framework import serializers
from .models import Etudiant, Cours, Programme, Cheminement, Session, Prerequis, CoursParSession

class ProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = '__all__'

class CoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cours
        fields = '__all__'

class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = '__all__'

class CheminementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cheminement
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    cours = CoursSerializer(many=True, read_only=True)
    class Meta:
        model = Session
        fields = '__all__'

class PrerequisSerializer(serializers.ModelSerializer):
    cours_nom = serializers.CharField(source='cours.nom_cours', read_only=True)
    prerequis_nom = serializers.CharField(source='prerequis.nom_cours', read_only=True)

    class Meta:
        model = Prerequis
        fields = '__all__'

class CoursParSessionSerializer(serializers.ModelSerializer):
    code_cours = serializers.CharField(source='cours.code_cours', read_only=True)
    nom_cours = serializers.CharField(source='cours.nom_cours', read_only=True)
    nom_session = serializers.CharField(source='session.nom_session', read_only=True)
    numero_session = serializers.IntegerField(source='session.numero_session', read_only=True)
    prerequis = serializers.SerializerMethodField()
    
    def get_prerequis(self, obj):
        prereqs = Prerequis.objects.filter(cours=obj.cours)
        return [p.prerequis.code_cours for p in prereqs]
    class Meta:
        model = CoursParSession
        fields = ['code_cours', 'nom_cours', 'nom_session', 'numero_session','prerequis']
